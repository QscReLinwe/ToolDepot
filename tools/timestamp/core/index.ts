import type { Tool, ToolOutput } from '@tooldepot/types';

export interface TimestampInput {
  /** 时间戳或日期字符串 */
  value: string;
  /** 转换模式:to-date 时间戳→日期 / to-timestamp 日期→时间戳,默认 to-date */
  mode?: 'to-date' | 'to-timestamp';
  /** 时间戳单位:s 秒 / ms 毫秒,默认 ms */
  unit?: 's' | 'ms';
}

export interface TimestampResult {
  result: string;
}

export const tool: Tool<TimestampInput, TimestampResult> = {
  id: 'timestamp',
  name: '时间戳转换',
  description: '时间戳 ↔ 日期 互转',
  category: 'datetime',
  async run(input): Promise<ToolOutput<TimestampResult>> {
    const value = typeof input?.value === 'string' ? input.value : '';
    const mode = input?.mode ?? 'to-date';
    const unit = input?.unit ?? 'ms';

    if (value.trim() === '') {
      return { ok: false, error: '输入为空' };
    }

    if (mode === 'to-timestamp') {
      let ms = Number.isNaN(Number(value)) ? Date.parse(value) : Number(value);
      if (Number.isNaN(ms)) {
        return { ok: false, error: '无法解析为时间戳或日期' };
      }
      if (unit === 's') {
        ms = Math.floor(ms / 1000);
      }
      return { ok: true, data: { result: String(ms) }, mimeType: 'text/plain' };
    }

    // to-date (default)
    let ms = Number(value);
    if (unit === 's') {
      ms *= 1000;
    }
    if (Number.isNaN(ms)) {
      return { ok: false, error: '无法解析为时间戳' };
    }
    return { ok: true, data: { result: new Date(ms).toISOString() }, mimeType: 'text/plain' };
  },
};

export default tool;
