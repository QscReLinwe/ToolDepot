import type { ToolOutput } from '@tooldepot/types';

export interface TextStatsInput {
  /** Text to analyze */
  text: string;
  /** Count CJK characters as words (affects words and readingMinutes) */
  cjk?: boolean;
}

export interface TextStatsOutput {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  lines: number;
  paragraphs: number;
  readingMinutes: number;
}

function countCjkChars(text: string): number {
  const matches = text.match(/[一-鿿぀-ヿ가-힯]/g);
  return matches ? matches.length : 0;
}

export const tool = {
  id: 'text-stats',
  name: '文本统计',
  description: '计算文本统计信息。',
  category: 'productivity',
  async run(input: TextStatsInput): Promise<ToolOutput<TextStatsOutput>> {
    const text = input?.text;
    if (typeof text !== 'string') {
      return { ok: false, error: 'text is required' };
    }
    const cjk = input?.cjk ?? false;

    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;

    const words = cjk ? countCjkChars(text) : text.trim() ? text.trim().split(/\s+/).length : 0;

    const lines = text === '' ? 0 : text.split(/\r\n|\r|\n/).length;

    const paragraphs = text.trim()
      ? text
          .split(/\n\s*\n/)
          .map((p) => p.trim())
          .filter((p) => p.length > 0).length
      : 0;

    const readingMinutes = Math.round((words / 200) * 100) / 100;

    return {
      ok: true,
      data: {
        characters,
        charactersNoSpaces,
        words,
        lines,
        paragraphs,
        readingMinutes,
      },
      mimeType: 'application/json',
    };
  },
};

export default tool;
