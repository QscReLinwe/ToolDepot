import type { Tool, ToolOutput } from '@tooldepot/types';

export interface Base64Input {
  /** text to encode / decode */
  text: string;
  /** mode: encode / decode, default encode */
  mode?: 'encode' | 'decode';
}

export interface Base64Result {
  result: string;
}

export function encodeBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

export function decodeBase64(text: string): string {
  const bin = atob(text);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export const tool: Tool<Base64Input, Base64Result> = {
  id: 'base64',
  name: 'Base64 编解码',
  description: 'Base64 编码与解码。',
  category: 'encode',
  async run(input): Promise<ToolOutput<Base64Result>> {
    const text = typeof input?.text === 'string' ? input.text : '';
    const mode = input?.mode ?? 'encode';

    if (text === '') {
      return { ok: false, error: 'input is empty' };
    }

    try {
      if (mode === 'decode') {
        return {
          ok: true,
          data: { result: decodeBase64(text) },
          mimeType: 'text/plain',
        };
      }
      return {
        ok: true,
        data: { result: encodeBase64(text) },
        mimeType: 'text/plain',
      };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  },
};

export default tool;
