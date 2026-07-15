import type { Tool, ToolOutput } from '@tooldepot/types';

export interface UrlCodecInput {
  text: string;
  mode?: 'encode' | 'decode';
}

export interface UrlCodecResult {
  result: string;
}

export const tool: Tool<UrlCodecInput, UrlCodecResult> = {
  id: 'url-codec',
  name: 'URL 编解码',
  description: 'URL 编码 / 解码 (encodeURIComponent / decodeURIComponent)',
  category: 'encode',
  async run(input): Promise<ToolOutput<UrlCodecResult>> {
    const text = typeof input?.text === 'string' ? input.text : '';
    const mode = input?.mode ?? 'encode';

    try {
      const result = mode === 'decode' ? decodeURIComponent(text) : encodeURIComponent(text);
      return {
        ok: true,
        data: { result },
        mimeType: 'text/plain',
      };
    } catch (e) {
      return {
        ok: false,
        error: e instanceof Error ? e.message : String(e),
      };
    }
  },
};

export default tool;
