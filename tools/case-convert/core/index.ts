import type { Tool, ToolOutput } from '@tooldepot/types';

export type CaseStyle = 'camel' | 'snake' | 'pascal' | 'kebab';

export interface CaseConvertInput {
  /** 待转换文本 */
  text: string;
  /** 源命名风格 */
  from: CaseStyle;
  /** 目标命名风格 */
  to: CaseStyle;
}

export interface CaseConvertResult {
  result: string;
}

const STYLES: CaseStyle[] = ['camel', 'snake', 'pascal', 'kebab'];

/** 将文本按源风格拆成小写词数组 */
export function splitWords(text: string, from: CaseStyle): string[] {
  let parts: string[];
  if (from === 'snake' || from === 'kebab') {
    const sep = from === 'snake' ? '_' : '-';
    parts = text.split(sep);
  } else {
    // camel / pascal: 按大写字母边界切分
    parts = text.replace(/([a-z0-9])([A-Z])/g, '$1 $2').split(/\s+/);
  }
  return parts.map((w) => w.trim().toLowerCase()).filter((w) => w.length > 0);
}

/** 按目标风格拼接词数组 */
export function joinWords(words: string[], to: CaseStyle): string {
  if (to === 'snake') {
    return words.join('_');
  }
  if (to === 'kebab') {
    return words.join('-');
  }
  if (to === 'camel') {
    return words.map((w, i) => (i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1))).join('');
  }
  // pascal
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');
}

export const tool: Tool<CaseConvertInput, CaseConvertResult> = {
  id: 'case-convert',
  name: '命名风格转换',
  description: '在 camel / snake / pascal / kebab 命名风格间转换',
  category: 'convert',
  async run(input): Promise<ToolOutput<CaseConvertResult>> {
    const text = typeof input?.text === 'string' ? input.text : '';
    const from = input?.from;
    const to = input?.to;

    if (text.trim() === '') {
      return { ok: false, error: '输入为空' };
    }
    if (!STYLES.includes(from) || !STYLES.includes(to)) {
      return { ok: false, error: 'from / to 必须是 camel | snake | pascal | kebab' };
    }

    try {
      const words = splitWords(text, from);
      const result = joinWords(words, to);
      return { ok: true, data: { result }, mimeType: 'text/plain' };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  },
};

export default tool;
