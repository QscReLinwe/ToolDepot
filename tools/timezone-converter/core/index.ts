import type { Tool, ToolOutput } from '@tooldepot/types';
import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';

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

export const tool: Tool<TimezoneConverterInput, TimezoneConverterOutput> = {
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

      // parseTimestamp returns a Date whose LOCAL fields are the wall-clock
      // digits the user entered (ISO strings parse as local; Unix values are
      // absolute instants whose local fields are their wall-clock). Rebuild a
      // local-naive Date from those components so fromZonedTime (which reads the
      // local fields) interprets them as wall-clock time in fromTz. Passing the
      // raw parsed Date would let fromZonedTime treat it as already-UTC and
      // double-apply the offset.
      const wallClock = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
        date.getMilliseconds(),
      );

      // Interpret the wall-clock time as being in fromTz to get the true UTC instant.
      const utcDate = fromZonedTime(wallClock, fromTz);

      // Format the UTC instant directly in the target timezone.
      const result = formatInTimeZone(utcDate, toTz, format);

      return {
        ok: true,
        data: {
          result,
          from: {
            timestamp: date.getTime().toString(),
            tz: fromTz,
            iso: formatInTimeZone(utcDate, fromTz, "yyyy-MM-dd'T'HH:mm:ssXXX"),
          },
          to: {
            timestamp: utcDate.getTime().toString(),
            tz: toTz,
            iso: formatInTimeZone(utcDate, toTz, "yyyy-MM-dd'T'HH:mm:ssXXX"),
          },
        },
        mimeType: 'application/json',
      };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  },
};

export default tool;
