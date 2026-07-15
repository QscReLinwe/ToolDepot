import type { Tool, ToolOutput } from '@tooldepot/types';

export interface BaseConvertInput {
  /** 要转换的值,源进制 */
  value: string;
  /** 源进制,默认 10,范围 2–36 */
  from?: number;
  /** 目标进制,默认 16,范围 2–36 */
  to?: number;
}

export interface BaseConvertResult {
  result: string;
}

export function convertBase(value: string, from: number, to: number): string {
  const cleaned = value.replace(/[\s_]/g, '');
  if (cleaned === '') {
    throw new Error('输入为空');
  }
  let n = 0n;
  for (const ch of cleaned) {
    const d = parseInt(ch, 36);
    if (Number.isNaN(d) || d < 0 || d >= from) {
      throw new Error(`字符 "${ch}" 不在 ${from} 进制范围内`);
    }
    n = n * BigInt(from) + BigInt(d);
  }
  return n.toString(to);
}

export const tool: Tool<BaseConvertInput, BaseConvertResult> = {
  id: 'base-convert',
  name: '进制转换',
  description: '在 2–36 进制间转换数字,支持 BigInt,自动识别非法字符',
  category: 'convert',
  async run(input): Promise<ToolOutput<BaseConvertResult>> {
    const value = typeof input?.value === 'string' ? input.value : '';
    const from = typeof input?.from === 'number' ? input.from : 10;
    const to = typeof input?.to === 'number' ? input.to : 16;

    if (!Number.isInteger(from) || from < 2 || from > 36) {
      return { ok: false, error: `源进制需在 2–36 之间,收到: ${from}` };
    }
    if (!Number.isInteger(to) || to < 2 || to > 36) {
      return { ok: false, error: `目标进制需在 2–36 之间,收到: ${to}` };
    }

    try {
      const result = convertBase(value, from, to);
      return { ok: true, data: { result }, mimeType: 'text/plain' };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  },
};

export default tool;
