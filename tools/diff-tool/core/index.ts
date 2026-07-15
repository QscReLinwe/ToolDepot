import type { ToolOutput } from '@tooldepot/types';

export type DiffMode = 'line' | 'char';

export interface DiffToolInput {
  a: string;
  b: string;
  mode?: DiffMode;
  ignoreWhitespace?: boolean;
}

export interface DiffHunk {
  type: 'context' | 'add' | 'del';
  text: string;
  lineA?: number;
  lineB?: number;
}

export interface DiffToolOutput {
  additions: number;
  deletions: number;
  unchanged: number;
  hunks: DiffHunk[];
}

interface Token {
  disp: string;
  cmp: string;
}

function buildTokens(text: string, mode: DiffMode, ignoreWhitespace: boolean): Token[] {
  const raw = mode === 'line' ? text.split('\n') : Array.from(text);
  if (!ignoreWhitespace) {
    return raw.map((v) => ({ disp: v, cmp: v }));
  }
  if (mode === 'line') {
    return raw.map((v) => ({ disp: v, cmp: v.trim() }));
  }
  return raw.filter((v) => !/\s/.test(v)).map((v) => ({ disp: v, cmp: v }));
}

type Op = { type: 'equal' | 'del' | 'add'; token: Token };

function lcsDiff(a: Token[], b: Token[]): Op[] {
  const n = a.length;
  const m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));

  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      if (a[i]!.cmp === b[j]!.cmp) {
        dp[i]![j] = dp[i + 1]![j + 1]! + 1;
      } else {
        dp[i]![j] = Math.max(dp[i + 1]![j]!, dp[i]![j + 1]!);
      }
    }
  }

  const ops: Op[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i]!.cmp === b[j]!.cmp) {
      ops.push({ type: 'equal', token: a[i]! });
      i++;
      j++;
    } else if (dp[i + 1]![j]! >= dp[i]![j + 1]!) {
      ops.push({ type: 'del', token: a[i]! });
      i++;
    } else {
      ops.push({ type: 'add', token: b[j]! });
      j++;
    }
  }
  while (i < n) {
    ops.push({ type: 'del', token: a[i]! });
    i++;
  }
  while (j < m) {
    ops.push({ type: 'add', token: b[j]! });
    j++;
  }
  return ops;
}

export const tool = {
  id: 'diff-tool',
  name: 'Diff 对比工具',
  description: '以行或字符级对比两段文本。',
  category: 'format',
  async run(input: DiffToolInput): Promise<ToolOutput<DiffToolOutput>> {
    const a = input?.a;
    const b = input?.b;
    const mode: DiffMode = input?.mode ?? 'line';
    const ignoreWhitespace = input?.ignoreWhitespace ?? false;

    if (typeof a !== 'string' || typeof b !== 'string') {
      return { ok: false, error: 'Missing required fields: a, b' };
    }
    if (mode !== 'line' && mode !== 'char') {
      return { ok: false, error: "Invalid mode (expected 'line' or 'char')" };
    }

    const aTokens = buildTokens(a, mode, ignoreWhitespace);
    const bTokens = buildTokens(b, mode, ignoreWhitespace);
    const ops = lcsDiff(aTokens, bTokens);

    const separator = mode === 'line' ? '\n' : '';
    const hunks: DiffHunk[] = [];
    let additions = 0;
    let deletions = 0;
    let unchanged = 0;
    let lineA = 1;
    let lineB = 1;

    for (const op of ops) {
      const hunkType: DiffHunk['type'] = op.type === 'equal' ? 'context' : op.type === 'add' ? 'add' : 'del';

      const last = hunks[hunks.length - 1];
      const startLineA = op.type === 'add' ? undefined : lineA;
      const startLineB = op.type === 'del' ? undefined : lineB;

      if (last && last.type === hunkType) {
        last.text += separator + op.token.disp;
      } else {
        const hunk: DiffHunk = { type: hunkType, text: op.token.disp };
        if (startLineA !== undefined) hunk.lineA = startLineA;
        if (startLineB !== undefined) hunk.lineB = startLineB;
        hunks.push(hunk);
      }

      if (op.type === 'equal') {
        unchanged++;
        lineA++;
        lineB++;
      } else if (op.type === 'del') {
        deletions++;
        lineA++;
      } else {
        additions++;
        lineB++;
      }
    }

    return {
      ok: true,
      data: { additions, deletions, unchanged, hunks },
      mimeType: 'application/json',
    };
  },
};

export default tool;
