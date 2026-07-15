import type { Tool, ToolOutput } from '@tooldepot/types';

export interface CountdownInput {
  duration: string;
}

export interface CountdownOutput {
  totalSeconds: number;
  formatted: string;
  endTime: string;
}

function parseDuration(str: string): number | null {
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(str)) {
    const parts = str.split(':').map(Number);
    if (parts.length === 3) return parts[0]! * 3600 + parts[1]! * 60 + parts[2]!;
    return parts[0]! * 60 + parts[1]!;
  }
  let total = 0;
  const matches = str.matchAll(/(\d+)([hms])/g);
  for (const m of matches) {
    const num = parseInt(m[1]!, 10);
    const unit = m[2]!;
    if (unit === 'h') total += num * 3600;
    else if (unit === 'm') total += num * 60;
    else if (unit === 's') total += num;
  }
  if (total > 0) return total;
  const num = parseInt(str, 10);
  if (!Number.isNaN(num)) return num;
  return null;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const parts = [];
  if (h > 0) parts.push(`${h}小时`);
  if (m > 0) parts.push(`${m}分钟`);
  if (s > 0 || parts.length === 0) parts.push(`${s}秒`);
  return parts.join('');
}

export const tool: Tool<CountdownInput, CountdownOutput> = {
  id: 'countdown',
  name: '倒计时',
  description: '简单倒计时，支持时分秒输入',
  category: 'utility',
  async run(input: CountdownInput): Promise<ToolOutput<CountdownOutput>> {
    if (!input?.duration) {
      return { ok: false, error: 'duration 是必填项，如: 25m, 1h30m, 1:30:00, 90, 90s' };
    }
    const totalSeconds = parseDuration(input.duration);
    if (totalSeconds === null || totalSeconds <= 0) {
      return { ok: false, error: 'duration 格式错误，支持: 25m, 1h30m, 1:30:00, 90, 90s' };
    }
    const endTime = new Date(Date.now() + totalSeconds * 1000);
    return {
      ok: true,
      data: {
        totalSeconds,
        formatted: formatDuration(totalSeconds),
        endTime: endTime.toISOString(),
      },
      mimeType: 'application/json',
    };
  },
};

export default tool;
