import type { Tool, ToolOutput } from '@tooldepot/types';

export type CsvTsvMode = 'csv2tsv' | 'tsv2csv' | 'csv2json' | 'json2csv';

export interface CsvTsvInput {
  mode: CsvTsvMode;
  text: string;
  delimiter?: string;
  hasHeader?: boolean;
}

export interface CsvTsvOutput {
  result: string;
  rows?: number;
  cols?: number;
}

/** Parse delimited text into rows of fields, honoring quotes and "" escaping. */
function parseDelimited(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let i = 0;
  const n = text.length;

  while (i < n) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += c;
      i++;
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (c === delimiter) {
      row.push(field);
      field = '';
      i++;
      continue;
    }
    if (c === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      i++;
      continue;
    }
    if (c === '\r') {
      if (text[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      i++;
      continue;
    }
    field += c;
    i++;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/** Quote a field for CSV output when it contains delimiter, quote, or newline. */
function csvQuote(field: string, delimiter: string): string {
  if (field.includes('"') || field.includes(delimiter) || field.includes('\n') || field.includes('\r')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

function toTsv(rows: string[][]): string {
  return rows.map((r) => r.join('\t')).join('\n');
}

function toCsv(rows: string[][], delimiter: string): string {
  return rows.map((r) => r.map((f) => csvQuote(f, delimiter)).join(delimiter)).join('\n');
}

export const tool: Tool<CsvTsvInput, CsvTsvOutput> = {
  id: 'csv-tsv',
  name: 'CSV / TSV 工具',
  description: '在 CSV、TSV 与 JSON 间转换。',
  category: 'convert',
  async run(input: CsvTsvInput): Promise<ToolOutput<CsvTsvOutput>> {
    const mode = input?.mode;
    const text = input?.text;
    const hasHeader = input?.hasHeader ?? true;

    if (!mode || !['csv2tsv', 'tsv2csv', 'csv2json', 'json2csv'].includes(mode)) {
      return { ok: false, error: 'Invalid or missing mode (expected csv2tsv|tsv2csv|csv2json|json2csv)' };
    }
    if (typeof text !== 'string') {
      return { ok: false, error: 'Missing required field: text' };
    }

    try {
      if (mode === 'csv2tsv') {
        const delim = input.delimiter ?? ',';
        const rows = parseDelimited(text, delim);
        const result = toTsv(rows);
        const cols = rows.reduce((m, r) => Math.max(m, r.length), 0);
        return { ok: true, data: { result, rows: rows.length, cols }, mimeType: 'text/tab-separated-values' };
      }

      if (mode === 'tsv2csv') {
        const delim = input.delimiter ?? '\t';
        const rows = parseDelimited(text, delim);
        const outDelim = ',';
        const result = toCsv(rows, outDelim);
        const cols = rows.reduce((m, r) => Math.max(m, r.length), 0);
        return { ok: true, data: { result, rows: rows.length, cols }, mimeType: 'text/csv' };
      }

      if (mode === 'csv2json') {
        const delim = input.delimiter ?? ',';
        const rows = parseDelimited(text, delim);
        if (rows.length === 0) {
          return { ok: true, data: { result: '[]', rows: 0, cols: 0 }, mimeType: 'application/json' };
        }
        let data: unknown;
        if (hasHeader) {
          const header = rows[0] ?? [];
          data = rows.slice(1).map((r) => {
            const obj: Record<string, string> = {};
            header.forEach((key, idx) => {
              obj[key] = r[idx] ?? '';
            });
            return obj;
          });
        } else {
          data = rows;
        }
        const result = JSON.stringify(data, null, 2);
        const cols = rows.reduce((m, r) => Math.max(m, r.length), 0);
        return { ok: true, data: { result, rows: rows.length, cols }, mimeType: 'application/json' };
      }

      // json2csv
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        return { ok: false, error: `Invalid JSON input: ${e instanceof Error ? e.message : String(e)}` };
      }
      if (!Array.isArray(parsed)) {
        return { ok: false, error: 'json2csv requires a JSON array' };
      }
      const outDelim = input.delimiter ?? ',';
      let rows: string[][];
      if (parsed.length > 0 && typeof parsed[0] === 'object' && parsed[0] !== null && !Array.isArray(parsed[0])) {
        const objs = parsed as Record<string, unknown>[];
        const keys = Object.keys(objs[0] ?? {});
        rows = hasHeader ? [keys] : [];
        for (const obj of objs) {
          rows.push(keys.map((k) => (obj[k] === undefined || obj[k] === null ? '' : String(obj[k]))));
        }
      } else {
        rows = (parsed as unknown[]).map((item) =>
          Array.isArray(item) ? item.map((v) => (v === undefined || v === null ? '' : String(v))) : [String(item)],
        );
      }
      const result = toCsv(rows, outDelim);
      const cols = rows.reduce((m, r) => Math.max(m, r.length), 0);
      return { ok: true, data: { result, rows: rows.length, cols }, mimeType: 'text/csv' };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  },
};

export default tool;
