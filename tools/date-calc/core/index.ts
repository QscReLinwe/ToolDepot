import type { Tool, ToolInput } from '@tooldepot/types';

export type DateCalcMode = 'add' | 'subtract' | 'diff' | 'weekday';

export interface DateCalcInput extends ToolInput {
  mode: DateCalcMode;
  startDate: string;
  endDate?: string;
  days?: number;
  months?: number;
  years?: number;
  countWorkdays?: boolean;
}

export interface DateCalcOutput {
  result: string;
  diffDays?: number;
  diffWorkdays?: number;
  weekday?: string;
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** Parse an ISO-ish date string. Date-only strings are treated as UTC midnight. */
function parseDate(value: string): Date | null {
  if (typeof value !== 'string' || value.trim() === '') return null;
  const trimmed = value.trim();
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? `${trimmed}T00:00:00.000Z` : trimmed;
  const d = new Date(normalized);
  return Number.isNaN(d.getTime()) ? null : d;
}

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function countWorkdays(start: Date, end: Date): number {
  const a = start.getTime();
  const b = end.getTime();
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  let count = 0;
  const cur = new Date(lo);
  while (cur.getTime() <= hi) {
    const day = cur.getUTCDay();
    if (day !== 0 && day !== 6) count++;
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return count;
}

export const tool: Tool<DateCalcInput, DateCalcOutput> = {
  id: 'date-calc',
  name: '日期计算器',
  description: '加减日期、计算差值与工作日。',
  category: 'utility',
  async run(input) {
    const mode = input?.mode;
    const startDateStr = input?.startDate;

    if (mode !== 'add' && mode !== 'subtract' && mode !== 'diff' && mode !== 'weekday') {
      return {
        ok: false,
        error: "mode must be 'add', 'subtract', 'diff', or 'weekday'",
      };
    }
    const start = parseDate(startDateStr);
    if (!start) {
      return { ok: false, error: 'startDate is required and must be a valid ISO date' };
    }

    if (mode === 'diff') {
      const end = parseDate(input?.endDate ?? '');
      if (!end) {
        return { ok: false, error: 'endDate is required for diff mode' };
      }
      const diffDays = Math.round((end.getTime() - start.getTime()) / 86400000);
      const data: DateCalcOutput = { result: toISODate(start), diffDays };
      if (input?.countWorkdays) {
        data.diffWorkdays = countWorkdays(start, end);
      }
      return { ok: true, data, mimeType: 'application/json' };
    }

    if (mode === 'weekday') {
      return {
        ok: true,
        data: {
          result: toISODate(start),
          weekday: WEEKDAYS[start.getUTCDay()],
        },
        mimeType: 'application/json',
      };
    }

    // add / subtract
    const days = Number(input?.days ?? 0);
    const months = Number(input?.months ?? 0);
    const years = Number(input?.years ?? 0);
    if (!Number.isFinite(days) || !Number.isFinite(months) || !Number.isFinite(years)) {
      return { ok: false, error: 'days, months, and years must be numbers' };
    }
    const sign = mode === 'subtract' ? -1 : 1;

    const result = new Date(start.getTime());
    if (years) result.setUTCFullYear(result.getUTCFullYear() + sign * years);
    if (months) result.setUTCMonth(result.getUTCMonth() + sign * months);
    if (days) result.setUTCDate(result.getUTCDate() + sign * days);

    return {
      ok: true,
      data: { result: toISODate(result) },
      mimeType: 'application/json',
    };
  },
};

export default tool;
