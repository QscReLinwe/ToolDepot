import type { Tool, ToolOutput } from '@tooldepot/types';

export interface ElectricityCostInput {
  /** Device power in watts. */
  powerW?: number;
  hoursPerDay?: number;
  /** Number of days to project (default 30). */
  days?: number;
  /** Electricity price per kWh. */
  pricePerKwh?: number;
  /** Currency symbol/code for display (optional). */
  currency?: string;
}

export interface ElectricityCostOutput {
  dailyKwh: number;
  totalKwh: number;
  cost: number;
  /** 30-day cost projection, independent of the days input. */
  monthlyCost?: number;
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

export const tool: Tool<ElectricityCostInput, ElectricityCostOutput> = {
  id: 'electricity-cost',
  name: '家电电费估算',
  description: '根据用量与电价估算电费。',
  category: 'home',
  async run(input: ElectricityCostInput): Promise<ToolOutput<ElectricityCostOutput>> {
    const powerW = input?.powerW;
    const hoursPerDay = input?.hoursPerDay;
    const days = input?.days ?? 30;
    const pricePerKwh = input?.pricePerKwh;

    if (!isFiniteNumber(powerW) || powerW < 0) {
      return { ok: false, error: 'powerW must be a non-negative number' };
    }
    if (!isFiniteNumber(hoursPerDay) || hoursPerDay < 0) {
      return { ok: false, error: 'hoursPerDay must be a non-negative number' };
    }
    if (!isFiniteNumber(days) || days <= 0) {
      return { ok: false, error: 'days must be a positive number' };
    }
    if (!isFiniteNumber(pricePerKwh) || pricePerKwh < 0) {
      return { ok: false, error: 'pricePerKwh must be a non-negative number' };
    }

    const dailyKwh = (powerW / 1000) * hoursPerDay;
    const totalKwh = dailyKwh * days;
    const cost = totalKwh * pricePerKwh;
    const monthlyCost = dailyKwh * 30 * pricePerKwh;

    return {
      ok: true,
      data: {
        dailyKwh,
        totalKwh,
        cost,
        monthlyCost,
      },
      mimeType: 'application/json',
    };
  },
};

export default tool;
