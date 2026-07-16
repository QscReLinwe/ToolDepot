import type { Tool, ToolOutput } from '@tooldepot/types';

export interface Base64ImageInput {
  /** 'encode' turns a data URL / raw base64 into raw base64; 'decode' turns base64 into a data URL. */
  mode: 'encode' | 'decode';
  /** For encode: a data URL (data:…;base64,…) or raw base64. For decode: raw base64 (optionally a full data URL). */
  data: string;
}

export interface Base64ImageOutput {
  /** encode → raw base64; decode → data URL */
  result: string;
  /** Detected MIME type when available (e.g. image/png). */
  mimeType?: string;
}

const DATA_URL_RE = /^data:([^;,]+)?(?:;base64)?,(.*)$/s;

function isBase64(s: string): boolean {
  if (!s) return false;
  // allow whitespace/newlines commonly found in pasted base64
  const cleaned = s.replace(/\s+/g, '');
  if (cleaned.length % 4 !== 0) return false;
  return /^[A-Za-z0-9+/]*={0,2}$/.test(cleaned);
}

export const tool: Tool<Base64ImageInput, Base64ImageOutput> = {
  id: 'base64-image',
  name: 'Base64 图片',
  description: '将图片与 Base64 Data URL 互相转换。',
  category: 'encode',
  async run(input: Base64ImageInput): Promise<ToolOutput<Base64ImageOutput>> {
    const mode = input?.mode;
    const data = typeof input?.data === 'string' ? input.data : '';

    if (mode !== 'encode' && mode !== 'decode') {
      return { ok: false, error: "mode must be 'encode' or 'decode'" };
    }
    if (data.trim() === '') {
      return { ok: false, error: 'data is empty' };
    }

    try {
      if (mode === 'encode') {
        const m = data.match(DATA_URL_RE);
        if (m) {
          const mime = m[1] || 'application/octet-stream';
          const b64 = m[2] ?? '';
          if (!isBase64(b64)) return { ok: false, error: 'Invalid base64 payload' };
          return { ok: true, data: { result: b64, mimeType: mime }, mimeType: 'text/plain' };
        }
        if (!isBase64(data)) return { ok: false, error: 'Invalid base64 payload' };
        return {
          ok: true,
          data: { result: data.replace(/\s+/g, ''), mimeType: 'application/octet-stream' },
          mimeType: 'text/plain',
        };
      }

      // decode
      const m = data.match(DATA_URL_RE);
      let b64: string;
      let mime: string;
      if (m) {
        mime = m[1] || 'image/png';
        b64 = m[2] ?? '';
      } else {
        mime = 'image/png';
        b64 = data;
      }
      const cleaned = b64.replace(/\s+/g, '');
      if (!isBase64(cleaned)) return { ok: false, error: 'Invalid base64 payload' };
      return {
        ok: true,
        data: { result: `data:${mime};base64,${cleaned}`, mimeType: mime },
        mimeType: mime,
      };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  },
};

export default tool;
