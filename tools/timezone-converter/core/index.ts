import type { ToolOutput } from '@tooldepot/types';
import { format as formatDate, fromZonedTime, toZonedTime } from 'date-fns-tz';

export interface TimezoneConverterInput {
  /** Source timestamp (ISO 8601, Unix ms, or Unix s) */
  timestamp: string | number;
  /** Source timezone (IANA tz database name, e.g., 'America/New_York', 'UTC') */
  fromTz: string;
  /** Target timezone (IANA) */
  toTz: string;
  /** Output format (date-fns format string) */
  format?: string;
}

export interface TimezoneConverterOutput {
  result: string;
  from: { timestamp: string; tz: string; iso: string };
  to: { timestamp: string; tz: string; iso: string };
}

const _COMMON_TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Anchorage',
  'Pacific/Honolulu',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Moscow',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Asia/Singapore',
  'Australia/Sydney',
  'Pacific/Auckland',
];

function parseTimestamp(ts: string | number): Date {
  if (typeof ts === 'number') {
    return new Date(ts < 1e12 ? ts * 1000 : ts);
  }
  const iso = new Date(ts);
  if (!Number.isNaN(iso.getTime())) return iso;
  const num = Number(ts);
  if (!Number.isNaN(num)) return new Date(num < 1e12 ? num * 1000 : num);
  throw new Error(`Invalid timestamp: ${ts}`);
}

export const tool = {
  id: 'timezone-converter',
  name: '时区转换器',
  description: '支持夏令时的跨时区时间戳转换',
  category: 'utility',
  async run(input: TimezoneConverterInput): Promise<ToolOutput<TimezoneConverterOutput>> {
    const timestamp = input?.timestamp;
    const fromTz = input?.fromTz;
    const toTz = input?.toTz;
    const format = input?.format ?? "yyyy-MM-dd'T'HH:mm:ssXXX";

    if (timestamp === undefined || !fromTz || !toTz) {
      return { ok: false, error: '缺少必填字段: timestamp, fromTz, toTz' };
    }

    try {
      const date = parseTimestamp(timestamp);
      if (Number.isNaN(date.getTime())) {
        return { ok: false, error: '无效的时间戳' };
      }

      // Convert source time in source timezone to UTC
      const utcDate = fromZonedTime(date, fromTz);

      // Convert UTC to target timezone
      const targetDate = toZonedTime(utcDate, toTz);
      const result = formatDate(targetDate, format, { timeZone: toTz });

      return {
        ok: true,
        data: {
          result,
          from: { timestamp: date.getTime().toString(), tz: fromTz, iso: date.toISOString() },
          to: { timestamp: targetDate.getTime().toString(), tz: toTz, iso: targetDate.toISOString() },
        },
        mimeType: 'application/json',
      };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  },
};

export default tool;
