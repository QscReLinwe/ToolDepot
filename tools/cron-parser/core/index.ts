import type { Tool, ToolOutput } from '@tooldepot/types';

export interface CronParserInput {
  /** Standard 5-field cron expression: "minute hour day-of-month month day-of-week". */
  expression: string;
  /** Optional IANA timezone label (informational; computation uses local time). */
  timezone?: string;
  /** Number of upcoming run times to compute (default 5). */
  count?: number;
}

export interface CronParserOutput {
  valid: boolean;
  error?: string;
  fields?: {
    minute: string;
    hour: string;
    dayOfMonth: string;
    month: string;
    dayOfWeek: string;
  };
  /** Human-readable description for each of the 5 fields. */
  descriptions: string[];
  /** Next N occurrence datetimes as ISO 8601 strings. */
  nextRuns: string[];
  /** A single natural-language summary of the schedule. */
  humanDescription: string;
}

interface FieldSpec {
  name: string;
  min: number;
  max: number;
  /** When true, value 7 is normalized to 0 (Sunday). */
  wrapSunday?: boolean;
}

const FIELD_SPECS: [FieldSpec, FieldSpec, FieldSpec, FieldSpec, FieldSpec] = [
  { name: 'minute', min: 0, max: 59 },
  { name: 'hour', min: 0, max: 23 },
  { name: 'dayOfMonth', min: 1, max: 31 },
  { name: 'month', min: 1, max: 12 },
  { name: 'dayOfWeek', min: 0, max: 7, wrapSunday: true },
];

const MONTH_NAMES = [
  '',
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const DOW_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function parseField(field: string, spec: FieldSpec): Set<number> {
  const result = new Set<number>();
  const tokens = field.split(',');
  for (const token of tokens) {
    if (token === '') throw new Error(`Empty list item in ${spec.name}`);
    let step = 1;
    let rangePart = token;
    if (token.includes('/')) {
      const parts = token.split('/');
      if (parts.length !== 2) throw new Error(`Invalid step syntax in ${spec.name}: "${token}"`);
      const [rp, stepStr] = parts;
      step = Number(stepStr);
      if (!Number.isInteger(step) || step < 1) {
        throw new Error(`Invalid step in ${spec.name}: "${token}"`);
      }
      rangePart = rp === '' || rp === undefined ? '*' : rp;
    }
    let low: number;
    let high: number;
    if (rangePart === '*') {
      low = spec.min;
      high = spec.max;
    } else if (rangePart.includes('-')) {
      const parts = rangePart.split('-');
      if (parts.length !== 2) throw new Error(`Invalid range in ${spec.name}: "${token}"`);
      const [a, b] = parts;
      low = Number(a);
      high = Number(b);
      if (!Number.isInteger(low) || !Number.isInteger(high)) {
        throw new Error(`Invalid range in ${spec.name}: "${token}"`);
      }
    } else {
      const v = Number(rangePart);
      if (!Number.isInteger(v)) throw new Error(`Invalid value in ${spec.name}: "${token}"`);
      low = high = v;
    }
    if (low < spec.min || high > spec.max) {
      throw new Error(`Value out of range in ${spec.name}: "${token}" (allowed ${spec.min}-${spec.max})`);
    }
    if (low > high) throw new Error(`Range start greater than end in ${spec.name}: "${token}"`);
    for (let i = low; i <= high; i += step) {
      result.add(spec.wrapSunday && i === 7 ? 0 : i);
    }
  }
  return result;
}

function describeField(field: string, spec: FieldSpec): string {
  if (field === '*') return `every ${spec.name}`;
  if (field.startsWith('*/')) {
    const step = field.slice(2);
    return `every ${step} ${spec.name}${step === '1' ? '' : 's'}`;
  }
  if (field.includes(',')) return `at ${spec.name}s ${field.split(',').join(', ')}`;
  if (field.includes('-')) return `every ${spec.name} from ${field.replace('-', ' through ')}`;
  return `at ${spec.name} ${field}`;
}

function buildHumanDescription(fields: string[]): string {
  const [minute, hour, dom, month, dow] = fields;
  const parts: string[] = [];
  parts.push(`At ${minute === '*' ? 'every minute' : describeField(minute ?? '', FIELD_SPECS[0])}`);
  parts.push(hour === '*' ? 'every hour' : describeField(hour ?? '', FIELD_SPECS[1]));
  if (dom !== '*' || dow !== '*') {
    const dayParts: string[] = [];
    if (dom !== '*') dayParts.push(`on day-of-month ${dom}`);
    if (dow !== '*') {
      const dowVals = (dow ?? '')
        .split(',')
        .flatMap((t) => t.split('-'))
        .map((v) => Number(v));
      const names = dowVals.map((v) => DOW_NAMES[v]).filter(Boolean);
      dayParts.push(`on ${names.join(', ')}`);
    }
    parts.push(dayParts.join(' '));
  }
  if (month !== '*') {
    const monthVals = (month ?? '')
      .split(',')
      .flatMap((t) => t.split('-'))
      .map((v) => Number(v));
    const names = monthVals.map((v) => MONTH_NAMES[v]).filter(Boolean);
    parts.push(`in ${names.join(', ')}`);
  }
  return parts.join(', ');
}

function matches(
  date: Date,
  sets: {
    minute: Set<number>;
    hour: Set<number>;
    dayOfMonth: Set<number>;
    month: Set<number>;
    dayOfWeek: Set<number>;
  },
  domAll: boolean,
  dowAll: boolean,
): boolean {
  const minute = date.getMinutes();
  const hour = date.getHours();
  const dom = date.getDate();
  const month = date.getMonth() + 1;
  const dow = date.getDay();
  if (!sets.minute.has(minute)) return false;
  if (!sets.hour.has(hour)) return false;
  if (!sets.month.has(month)) return false;
  // When a field is "*" its set is universal (contains every valid value), so
  // the universal field always matches. Using AND here is equivalent to OR for
  // the non-universal field; for the both-"*" case both always match.
  if (domAll || dowAll) {
    return sets.dayOfMonth.has(dom) && sets.dayOfWeek.has(dow);
  }
  return sets.dayOfMonth.has(dom) || sets.dayOfWeek.has(dow);
}

export const tool: Tool<CronParserInput, CronParserOutput> = {
  id: 'cron-parser',
  name: 'Cron 表达式解析',
  description: '将 Cron 表达式解析为可读的调度说明。',
  category: 'dev',
  async run(input: CronParserInput): Promise<ToolOutput<CronParserOutput>> {
    const expression = input?.expression;
    if (!expression || typeof expression !== 'string' || expression.trim() === '') {
      return { ok: false, error: 'Missing required field: expression' };
    }
    const count = input?.count === undefined ? 5 : Number(input.count);
    if (!Number.isInteger(count) || count < 1 || count > 100) {
      return { ok: false, error: 'count must be an integer between 1 and 100' };
    }

    const rawFields = expression.trim().split(/\s+/);
    if (rawFields.length !== 5) {
      return {
        ok: false,
        error: `Expected 5 fields (minute hour day-of-month month day-of-week), got ${rawFields.length}`,
      };
    }

    try {
      const sets = {
        minute: parseField(rawFields[0] ?? '', FIELD_SPECS[0]),
        hour: parseField(rawFields[1] ?? '', FIELD_SPECS[1]),
        dayOfMonth: parseField(rawFields[2] ?? '', FIELD_SPECS[2]),
        month: parseField(rawFields[3] ?? '', FIELD_SPECS[3]),
        dayOfWeek: parseField(rawFields[4] ?? '', FIELD_SPECS[4]),
      };
      const domAll = rawFields[2] === '*';
      const dowAll = rawFields[4] === '*';

      const descriptions = FIELD_SPECS.map((spec, i) => describeField(rawFields[i] ?? '', spec));
      const humanDescription = buildHumanDescription(rawFields);

      const nextRuns: string[] = [];
      const start = new Date();
      start.setSeconds(0, 0);
      const MAX_ITER = 5 * 366 * 24 * 60; // ~5 years of minutes
      const cursor = new Date(start.getTime());
      for (let i = 0; i < MAX_ITER && nextRuns.length < count; i++) {
        if (matches(cursor, sets, domAll, dowAll)) {
          nextRuns.push(cursor.toISOString());
        }
        cursor.setTime(cursor.getTime() + 60_000);
      }

      return {
        ok: true,
        data: {
          valid: true,
          fields: {
            minute: rawFields[0] ?? '',
            hour: rawFields[1] ?? '',
            dayOfMonth: rawFields[2] ?? '',
            month: rawFields[3] ?? '',
            dayOfWeek: rawFields[4] ?? '',
          },
          descriptions,
          nextRuns,
          humanDescription,
        },
        mimeType: 'application/json',
      };
    } catch (e) {
      return {
        ok: false,
        error: e instanceof Error ? e.message : String(e),
      };
    }
  },
};

export default tool;
