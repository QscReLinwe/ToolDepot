import type { ToolOutput } from '@tooldepot/types';

export interface ReadingTimeInput {
  /** Text to analyze */
  text: string;
  /** Words per minute (default 200) */
  wpm?: number;
  /** Count CJK characters instead of whitespace-separated words */
  cjk?: boolean;
}

export interface ReadingTimeOutput {
  words: number;
  minutes: number;
  seconds: number;
}

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function countCjkChars(text: string): number {
  // Count CJK unified ideographs, hiragana, katakana, hangul syllables.
  const matches = text.match(/[一-鿿぀-ヿ가-힯]/g);
  return matches ? matches.length : 0;
}

export const tool = {
  id: 'reading-time',
  name: '阅读时间估算',
  description: '估算文本阅读时间。',
  category: 'productivity',
  async run(input: ReadingTimeInput): Promise<ToolOutput<ReadingTimeOutput>> {
    const text = input?.text;
    if (typeof text !== 'string') {
      return { ok: false, error: 'text is required' };
    }
    const wpm = input?.wpm ?? 200;
    const cjk = input?.cjk ?? false;

    if (!Number.isFinite(wpm) || wpm <= 0) {
      return { ok: false, error: 'wpm must be a positive number' };
    }

    const words = cjk ? countCjkChars(text) : countWords(text);
    const minutesExact = words / wpm;
    const totalSeconds = Math.round(minutesExact * 60);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return {
      ok: true,
      data: { words, minutes, seconds },
      mimeType: 'application/json',
    };
  },
};

export default tool;
