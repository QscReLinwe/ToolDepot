import type { ToolOutput } from '@tooldepot/types';

export type DedupSortOrder = 'asc' | 'desc' | 'none';

export interface DedupSortInput {
  /** Text to process (one entry per line) */
  text: string;
  /** Sort order (default 'none') */
  sort?: DedupSortOrder;
  /** Remove duplicate lines (default true) */
  unique?: boolean;
  /** Case-insensitive comparison for dedup and sort (default true) */
  ignoreCase?: boolean;
  /** Drop blank/whitespace-only lines (default true) */
  removeBlank?: boolean;
  /** Compare lines as numbers when sorting/deduping (default false) */
  numeric?: boolean;
}

export interface DedupSortOutput {
  lines: string[];
  count: number;
  removed: number;
}

function isBlank(line: string): boolean {
  return line.trim().length === 0;
}

function keyOf(line: string, ignoreCase: boolean): string {
  return ignoreCase ? line.toLowerCase() : line;
}

function numOf(line: string): number {
  const n = Number(line.trim());
  return Number.isNaN(n) ? Number.NaN : n;
}

export const tool = {
  id: 'dedup-sort',
  name: '去重 / 排序',
  description: '对文本行去重并排序。',
  category: 'productivity',
  async run(input: DedupSortInput): Promise<ToolOutput<DedupSortOutput>> {
    const text = input?.text;
    if (typeof text !== 'string') {
      return { ok: false, error: 'text is required' };
    }
    const sort = input?.sort ?? 'none';
    const unique = input?.unique ?? true;
    const ignoreCase = input?.ignoreCase ?? true;
    const removeBlank = input?.removeBlank ?? true;
    const numeric = input?.numeric ?? false;

    if (!['asc', 'desc', 'none'].includes(sort)) {
      return { ok: false, error: "sort must be 'asc', 'desc', or 'none'" };
    }

    const original = text.split(/\r\n|\r|\n/);
    let lines = original.slice();

    if (removeBlank) {
      lines = lines.filter((l) => !isBlank(l));
    }

    if (unique) {
      const seen = new Set<string>();
      const result: string[] = [];
      for (const line of lines) {
        const key = numeric ? String(numOf(line)) : keyOf(line, ignoreCase);
        if (!seen.has(key)) {
          seen.add(key);
          result.push(line);
        }
      }
      lines = result;
    }

    if (sort !== 'none') {
      const dir = sort === 'asc' ? 1 : -1;
      lines = lines.slice().sort((a, b) => {
        let cmp: number;
        if (numeric) {
          cmp = numOf(a) - numOf(b);
          if (Number.isNaN(numOf(a)) && Number.isNaN(numOf(b))) {
            cmp = a.localeCompare(b);
          } else if (Number.isNaN(numOf(a))) {
            return dir; // NaNs sort last regardless of direction
          } else if (Number.isNaN(numOf(b))) {
            return -dir;
          }
        } else if (ignoreCase) {
          cmp = a.toLowerCase().localeCompare(b.toLowerCase());
        } else {
          cmp = a.localeCompare(b);
        }
        return cmp * dir;
      });
    }

    return {
      ok: true,
      data: {
        lines,
        count: lines.length,
        removed: original.length - lines.length,
      },
      mimeType: 'application/json',
    };
  },
};

export default tool;
