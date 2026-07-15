import type { ToolOutput } from '@tooldepot/types';

export type MinifyMode = 'css' | 'js';

export interface CssJsMinifyInput {
  mode: MinifyMode;
  code: string;
}

export interface CssJsMinifyOutput {
  minified: string;
  originalBytes: number;
  minifiedBytes: number;
  savedPercent: number;
}

function byteLength(s: string): number {
  try {
    if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(s).length;
  } catch {
    /* fall through */
  }
  return s.length;
}

function minifyCss(code: string): string {
  let out = '';
  const n = code.length;
  let i = 0;
  let inString: string | null = null;

  while (i < n) {
    const c = code[i];
    if (!inString && c === '/' && code[i + 1] === '*') {
      i += 2;
      while (i < n && !(code[i] === '*' && code[i + 1] === '/')) i++;
      i += 2;
      continue;
    }
    if (inString) {
      out += c;
      if (c === inString && code[i - 1] !== '\\') inString = null;
      i++;
      continue;
    }
    if (c === '"' || c === "'") {
      inString = c;
      out += c;
      i++;
      continue;
    }
    if (c === ' ' || c === '\t' || c === '\n' || c === '\r' || c === '\f') {
      const last = out[out.length - 1];
      if (last !== ' ' && last !== undefined && !'{};:,.('.includes(last)) {
        out += ' ';
      }
      i++;
      continue;
    }
    out += c;
    i++;
  }

  let res = out.replace(/\s*([{};:,])\s*/g, '$1');
  res = res.replace(/;}/g, '}');
  return res.trim();
}

function minifyJs(code: string): string {
  let out = '';
  const n = code.length;
  let i = 0;

  while (i < n) {
    const c = code[i];
    if (c === '/' && code[i + 1] === '/') {
      i += 2;
      while (i < n && code[i] !== '\n') i++;
      continue;
    }
    if (c === '/' && code[i + 1] === '*') {
      i += 2;
      while (i < n && !(code[i] === '*' && code[i + 1] === '/')) i++;
      i += 2;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') {
      const quote = c;
      out += c;
      i++;
      while (i < n) {
        const ch = code[i];
        out += ch;
        if (ch === '\\') {
          out += code[i + 1] ?? '';
          i += 2;
          continue;
        }
        if (ch === quote) {
          i++;
          break;
        }
        i++;
      }
      continue;
    }
    if (c === '/') {
      const prev = out[out.length - 1];
      const isRegex = prev === undefined || /[=:(,;!&|?{}[\]+*~/>\s]/.test(prev);
      if (isRegex) {
        out += c;
        i++;
        let inClass = false;
        while (i < n) {
          const ch = code[i];
          out += ch;
          if (ch === '\\') {
            out += code[i + 1] ?? '';
            i += 2;
            continue;
          }
          if (ch === '[') inClass = true;
          else if (ch === ']') inClass = false;
          else if (ch === '/' && !inClass) {
            i++;
            break;
          }
          i++;
        }
        while (i < n && /[a-z]/i.test(code[i] ?? '')) {
          out += code[i];
          i++;
        }
        continue;
      }
    }
    if (c === ' ' || c === '\t' || c === '\n' || c === '\r') {
      const last = out[out.length - 1];
      if (last !== ' ' && last !== undefined && !'{};,:([=.+-*/%&|!<>?'.includes(last)) {
        out += ' ';
      }
      i++;
      continue;
    }
    out += c;
    i++;
  }

  const res = out.replace(/\s*([{};,:])\s*/g, '$1');
  return res.trim();
}

export const tool = {
  id: 'css-js-minify',
  name: 'CSS/JS 压缩',
  description: '压缩 CSS 与 JavaScript 以减小体积。',
  category: 'format',
  async run(input: CssJsMinifyInput): Promise<ToolOutput<CssJsMinifyOutput>> {
    const mode = input?.mode;
    if (mode !== 'css' && mode !== 'js') {
      return { ok: false, error: 'mode must be "css" or "js"' };
    }
    const code = input?.code;
    if (typeof code !== 'string') {
      return { ok: false, error: 'Missing required field: code' };
    }

    const minified = mode === 'css' ? minifyCss(code) : minifyJs(code);
    const originalBytes = byteLength(code);
    const minifiedBytes = byteLength(minified);
    const savedPercent = originalBytes === 0 ? 0 : ((originalBytes - minifiedBytes) / originalBytes) * 100;

    return {
      ok: true,
      data: {
        minified,
        originalBytes,
        minifiedBytes,
        savedPercent: Math.round(savedPercent * 100) / 100,
      },
      mimeType: 'text/plain',
    };
  },
};

export default tool;
