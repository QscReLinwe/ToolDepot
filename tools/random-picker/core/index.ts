import type { Tool, ToolInput } from '@tooldepot/types';

export type PickerMode = 'pick-one' | 'pick-n' | 'shuffle' | 'groups';

export interface RandomPickerInput extends ToolInput {
  /** Raw item list as newline- or comma-separated text. Parsed in core. */
  text: string;
  /** Pre-parsed items (optional; if omitted, parsed from `text`). */
  items?: string[];
  mode: PickerMode;
  /** Number of items for pick-n (default 1). */
  count?: number;
  /** Group size for groups mode (default 2). */
  groupSize?: number;
}

export interface RandomPickerOutput {
  result: string[];
  groups?: string[][];
}

function randomFloat(): number {
  if (
    typeof globalThis !== 'undefined' &&
    typeof globalThis.crypto !== 'undefined' &&
    'getRandomValues' in globalThis.crypto
  ) {
    const arr = new Uint32Array(1);
    globalThis.crypto.getRandomValues(arr);
    return (arr[0] ?? 0) / 0x100000000;
  }
  return Math.random();
}

function parseItems(text: string, items?: string[]): string[] {
  if (Array.isArray(items)) {
    return items.map((s) => String(s).trim()).filter((s) => s.length > 0);
  }
  return text
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function shuffle<T>(arr: T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(randomFloat() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

export const tool: Tool<RandomPickerInput, RandomPickerOutput> = {
  id: 'random-picker',
  name: '随机抽签 / 分组',
  description: '随机抽取、打乱或分组。',
  category: 'utility',
  async run(input) {
    const mode = input?.mode;
    const text = typeof input?.text === 'string' ? input.text : '';
    const items = parseItems(text, input?.items);

    if (!mode || !['pick-one', 'pick-n', 'shuffle', 'groups'].includes(mode)) {
      return {
        ok: false,
        error: 'mode must be one of: pick-one, pick-n, shuffle, groups',
      };
    }
    if (items.length === 0) {
      return { ok: false, error: 'No items provided. Enter at least one item.' };
    }

    try {
      if (mode === 'pick-one') {
        const idx = Math.floor(randomFloat() * items.length);
        return { ok: true, data: { result: [items[idx] ?? ''] }, mimeType: 'application/json' };
      }

      if (mode === 'pick-n') {
        const count = typeof input?.count === 'number' && input.count > 0 ? Math.floor(input.count) : 1;
        const pool = shuffle(items);
        const picked = pool.slice(0, Math.min(count, pool.length));
        return { ok: true, data: { result: picked }, mimeType: 'application/json' };
      }

      if (mode === 'shuffle') {
        return { ok: true, data: { result: shuffle(items) }, mimeType: 'application/json' };
      }

      // groups
      const groupSize = typeof input?.groupSize === 'number' && input.groupSize > 0 ? Math.floor(input.groupSize) : 2;
      const shuffled = shuffle(items);
      const groups: string[][] = [];
      for (let i = 0; i < shuffled.length; i += groupSize) {
        groups.push(shuffled.slice(i, i + groupSize));
      }
      return { ok: true, data: { result: shuffled, groups }, mimeType: 'application/json' };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  },
};

export default tool;
