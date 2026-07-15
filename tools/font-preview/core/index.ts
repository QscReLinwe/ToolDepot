import type { Tool, ToolInput, ToolOutput } from '@tooldepot/types';

export interface FontPreviewInput extends ToolInput {
  /** Sample text to preview (default 'The quick brown fox'). */
  text?: string;
  /** Optional custom font list. Falls back to a sensible default set. */
  sampleFonts?: string[];
}

export interface FontPreviewOutput {
  text: string;
  fonts: string[];
}

const DEFAULT_FONTS = [
  'Arial',
  'Helvetica',
  'Georgia',
  'Times New Roman',
  'Courier New',
  'Verdana',
  'Tahoma',
  'Comic Sans MS',
  'Courier',
  'Lucida Console',
  'Impact',
  'Trebuchet MS',
  'Palatino Linotype',
  'Garamond',
  'Segoe UI',
  'Roboto',
  'Open Sans',
];

export const tool: Tool<FontPreviewInput, FontPreviewOutput> = {
  id: 'font-preview',
  name: '字体预览',
  description: '在多种字体中预览文本。',
  category: 'design',
  async run(input) {
    const text = typeof input?.text === 'string' && input.text.trim().length > 0 ? input.text : 'The quick brown fox';

    let fonts: string[];
    if (Array.isArray(input?.sampleFonts) && input.sampleFonts.length > 0) {
      fonts = input.sampleFonts.map((f) => String(f).trim()).filter((f) => f.length > 0);
    } else {
      fonts = DEFAULT_FONTS.slice();
    }

    if (fonts.length === 0) {
      return { ok: false, error: 'No fonts provided' };
    }

    const output: ToolOutput<FontPreviewOutput> = {
      ok: true,
      data: { text, fonts },
      mimeType: 'application/json',
    };
    return output;
  },
};

export default tool;
