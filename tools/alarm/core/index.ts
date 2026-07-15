import type { Tool, ToolOutput } from '@tooldepot/types';

export interface AlarmInput {
  time: string;
  label?: string;
}

export interface AlarmOutput {
  triggerTime: string;
  label?: string;
  secondsUntil: number;
  text: string;
}

function parseTime(str: string): Date | null {
  const now = new Date();

  if (/^\d{1,2}:\d{2}$/.test(str)) {
    const [h, m] = str.split(':').map(Number);
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);
    if (d <= now) d.setDate(d.getDate() + 1);
    return d;
  }

  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(str)) {
    const d = new Date(str);
    if (Number.isNaN(d.getTime())) return null;
    return d;
  }

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

export const tool: Tool<AlarmInput, AlarmOutput> = {
  id: 'alarm',
  name: '闹钟',
  description: '设置指定时间触发提醒',
  category: 'utility',
  async run(input: AlarmInput): Promise<ToolOutput<AlarmOutput>> {
    if (!input?.time) {
      return { ok: false, error: 'time (HH:mm 或 YYYY-MM-DDTHH:mm) 是必填项' };
    }

    const trigger = parseTime(input.time);
    if (!trigger) {
      return { ok: false, error: 'time 格式支持: HH:mm, YYYY-MM-DDTHH:mm' };
    }

    const now = new Date();
    const secondsUntil = Math.max(0, Math.floor((trigger.getTime() - now.getTime()) / 1000));

    const message = input.label || '闹钟时间到';

    return {
      ok: true,
      data: {
        triggerTime: trigger.toISOString(),
        label: input.label,
        secondsUntil,
        text: `${message} - ${formatDuration(secondsUntil)}后触发`,
      },
      mimeType: 'application/json',
    };
  },
};

export default tool;
