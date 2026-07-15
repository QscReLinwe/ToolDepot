import type { ToolOutput } from '@tooldepot/types';

export interface PomodoroInput {
  /** Work duration in minutes (default 25) */
  workMin?: number;
  /** Short break duration in minutes (default 5) */
  breakMin?: number;
  /** Long break duration in minutes (default 15) */
  longBreakMin?: number;
  /** Number of work rounds before a long break (default 4) */
  rounds?: number;
}

export type PomodoroSegmentType = 'work' | 'break' | 'longBreak';

export interface PomodoroSegment {
  type: PomodoroSegmentType;
  minutes: number;
}

export interface PomodoroOutput {
  schedule: PomodoroSegment[];
  totalMinutes: number;
}

function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

export const tool = {
  id: 'pomodoro',
  name: '番茄钟 / 专注计时',
  description: '生成番茄工作/休息时间表。',
  category: 'productivity',
  async run(input: PomodoroInput): Promise<ToolOutput<PomodoroOutput>> {
    const workMin = input?.workMin ?? 25;
    const breakMin = input?.breakMin ?? 5;
    const longBreakMin = input?.longBreakMin ?? 15;
    const rounds = input?.rounds ?? 4;

    if (!isPositiveNumber(workMin)) {
      return { ok: false, error: 'workMin must be a positive number' };
    }
    if (!isPositiveNumber(breakMin)) {
      return { ok: false, error: 'breakMin must be a positive number' };
    }
    if (!isPositiveNumber(longBreakMin)) {
      return { ok: false, error: 'longBreakMin must be a positive number' };
    }
    if (!Number.isInteger(rounds) || rounds < 1) {
      return { ok: false, error: 'rounds must be a positive integer' };
    }

    const schedule: PomodoroSegment[] = [];
    for (let i = 1; i <= rounds; i++) {
      schedule.push({ type: 'work', minutes: workMin });
      if (i < rounds) {
        schedule.push({ type: 'break', minutes: breakMin });
      } else {
        schedule.push({ type: 'longBreak', minutes: longBreakMin });
      }
    }

    const totalMinutes = schedule.reduce((sum, seg) => sum + seg.minutes, 0);

    return {
      ok: true,
      data: { schedule, totalMinutes },
      mimeType: 'application/json',
    };
  },
};

export default tool;
