import type { Tool, ToolOutput } from '@tooldepot/types';

export type TextHashAlgorithm = 'sha1' | 'sha256' | 'sha512';

export interface TextHashInput {
  /** 待哈希的文本 */
  text: string;
  /** 哈希算法,默认 sha256 */
  algorithm?: TextHashAlgorithm;
}

export interface TextHashResult {
  result: string;
}

const SUPPORTED: readonly TextHashAlgorithm[] = ['sha1', 'sha256', 'sha512'];

/** 规范算法名:浏览器接受大小写,Node 的 Web Crypto 仅接受大写形式。 */
const CANONICAL: Record<TextHashAlgorithm, string> = {
  sha1: 'SHA-1',
  sha256: 'SHA-256',
  sha512: 'SHA-512',
};

function toHex(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let hex = '';
  for (const b of bytes) {
    hex += b.toString(16).padStart(2, '0');
  }
  return hex;
}

export const tool: Tool<TextHashInput, TextHashResult> = {
  id: 'text-hash',
  name: '文本哈希',
  description: '使用 Web Crypto 计算文本的 SHA-1 / SHA-256 / SHA-512 哈希',
  category: 'crypto',
  async run(input): Promise<ToolOutput<TextHashResult>> {
    const text = typeof input?.text === 'string' ? input.text : '';
    const algorithm = input?.algorithm ?? 'sha256';

    if (!SUPPORTED.includes(algorithm)) {
      return { ok: false, error: `不支持的算法: ${String(algorithm)}` };
    }

    try {
      const buf = await crypto.subtle.digest(CANONICAL[algorithm], new TextEncoder().encode(text));
      return {
        ok: true,
        data: { result: toHex(buf) },
        mimeType: 'text/plain',
      };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  },
};

export default tool;
