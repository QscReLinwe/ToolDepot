import type { Tool, ToolOutput } from '@tooldepot/types';

export type EntityMode = 'encode' | 'decode';

export interface HtmlEntityInput {
  mode: EntityMode;
  text: string;
  /** When true (default), use named entities for the 5 basic chars; non-ASCII always uses numeric. */
  named?: boolean;
}

export interface HtmlEntityOutput {
  result: string;
}

const NAMED: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
};

function encodeText(text: string, named: boolean): string {
  let out = '';
  for (const ch of text) {
    const cp = ch.codePointAt(0) ?? 0;
    if (NAMED[ch] !== undefined) {
      out += named ? NAMED[ch] : `&#${cp};`;
    } else if (cp > 127) {
      out += `&#${cp};`;
    } else {
      out += ch;
    }
  }
  return out;
}

function decodeText(text: string): string {
  return text.replace(/&(#x[0-9a-fA-F]+;|#[0-9]+;|[a-zA-Z][a-zA-Z0-9]*;)/g, (m) => {
    if (m === '&amp;') return '&';
    if (m === '&lt;') return '<';
    if (m === '&gt;') return '>';
    if (m === '&quot;') return '"';
    if (m === '&apos;') return "'";
    if (m.startsWith('&#x') || m.startsWith('&#X')) {
      const cp = parseInt(m.slice(3, -1), 16);
      if (Number.isNaN(cp)) return m;
      return String.fromCodePoint(cp);
    }
    if (m.startsWith('&#')) {
      const cp = parseInt(m.slice(2, -1), 10);
      if (Number.isNaN(cp)) return m;
      return String.fromCodePoint(cp);
    }
    return m;
  });
}

export const tool: Tool<HtmlEntityInput, HtmlEntityOutput> = {
  id: 'html-entity',
  name: 'HTML 实体编解码',
  description: '编码与解码 HTML 实体及数字字符引用。',
  category: 'encode',
  async run(input: HtmlEntityInput): Promise<ToolOutput<HtmlEntityOutput>> {
    const mode = input?.mode;
    if (mode !== 'encode' && mode !== 'decode') {
      return { ok: false, error: 'mode must be "encode" or "decode"' };
    }
    const text = input?.text;
    if (typeof text !== 'string') {
      return { ok: false, error: 'Missing required field: text' };
    }
    const named = input?.named ?? true;

    const result = mode === 'encode' ? encodeText(text, named) : decodeText(text);
    return { ok: true, data: { result }, mimeType: 'text/plain' };
  },
};

export default tool;
