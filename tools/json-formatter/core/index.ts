import type { Tool, ToolOutput } from '@tooldepot/types';

export interface JsonFormatterInput {
  /** 原始 JSON 文本 */
  text: string;
  /** 处理模式:format 美化 / compress 压缩 / validate 校验,默认 format */
  mode?: 'format' | 'compress' | 'validate';
  /** format 模式的缩进空格数,默认 2 */
  indent?: number;
}

export interface JsonFormatterResult {
  result: string;
}

export function formatJson(text: string, indent = 2): string {
  return JSON.stringify(JSON.parse(text), null, indent);
}

export function compressJson(text: string): string {
  return JSON.stringify(JSON.parse(text));
}

export function validateJson(text: string): { valid: true } | { valid: false; error: string } {
  try {
    JSON.parse(text);
    return { valid: true };
  } catch (e) {
    return { valid: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export const tool: Tool<JsonFormatterInput, JsonFormatterResult> = {
  id: 'json-formatter',
  name: 'JSON 格式化',
  description: 'JSON 美化 / 压缩 / 校验',
  category: 'format',
  async run(input): Promise<ToolOutput<JsonFormatterResult>> {
    const text = typeof input?.text === 'string' ? input.text : '';
    const mode = input?.mode ?? 'format';
    const indent = typeof input?.indent === 'number' && input.indent >= 0 ? input.indent : 2;

    if (text.trim() === '') {
      return { ok: false, error: '输入为空' };
    }

    try {
      if (mode === 'compress') {
        return {
          ok: true,
          data: { result: compressJson(text) },
          mimeType: 'application/json',
        };
      }
      if (mode === 'validate') {
        const v = validateJson(text);
        if (!v.valid) {
          return { ok: false, error: `JSON 校验失败: ${v.error}` };
        }
        return { ok: true, data: { result: 'valid' }, mimeType: 'text/plain' };
      }
      // format (default)
      return {
        ok: true,
        data: { result: formatJson(text, indent) },
        mimeType: 'application/json',
      };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  },
};

export default tool;
