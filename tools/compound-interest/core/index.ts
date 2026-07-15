import type { ToolOutput } from '@tooldepot/types';

export interface CompoundInterestInput {
  /** Initial lump sum. */
  principal: number;
  /** Annual nominal interest rate in percent (e.g. 5 for 5%). */
  annualRate: number;
  /** Number of years. */
  years: number;
  /** Compounding frequency per year: 1, 4, 12, or 365. */
  compoundsPerYear: number;
  /** Optional fixed contribution added every month. */
  monthlyContribution?: number;
  /** Whether the monthly contribution is applied at the start or end of each period. */
  contributionAt?: 'start' | 'end';
}

export interface CompoundInterestSchedulePoint {
  period: number;
  balance: number;
}

export interface CompoundInterestOutput {
  futureValue: number;
  totalContributions: number;
  totalInterest: number;
  schedule?: CompoundInterestSchedulePoint[];
}

const VALID_FREQUENCIES = [1, 4, 12, 365];

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export const tool = {
  id: 'compound-interest',
  name: '复利计算器',
  description: '计算复利，支持定期定额投入。',
  category: 'finance',
  async run(input: CompoundInterestInput): Promise<ToolOutput<CompoundInterestOutput>> {
    const principal = input?.principal;
    const annualRate = input?.annualRate;
    const years = input?.years;
    const compoundsPerYear = input?.compoundsPerYear;
    const monthlyContribution = input?.monthlyContribution;
    const contributionAt = input?.contributionAt ?? 'end';

    if (typeof principal !== 'number' || !Number.isFinite(principal) || principal < 0) {
      return { ok: false, error: 'principal must be a non-negative number' };
    }
    if (typeof annualRate !== 'number' || !Number.isFinite(annualRate) || annualRate < 0) {
      return { ok: false, error: 'annualRate must be a non-negative number' };
    }
    if (typeof years !== 'number' || !Number.isFinite(years) || years <= 0) {
      return { ok: false, error: 'years must be a positive number' };
    }
    if (
      typeof compoundsPerYear !== 'number' ||
      !Number.isFinite(compoundsPerYear) ||
      !VALID_FREQUENCIES.includes(compoundsPerYear)
    ) {
      return { ok: false, error: 'compoundsPerYear must be one of 1, 4, 12, or 365' };
    }
    if (
      monthlyContribution !== undefined &&
      (typeof monthlyContribution !== 'number' || !Number.isFinite(monthlyContribution) || monthlyContribution < 0)
    ) {
      return { ok: false, error: 'monthlyContribution must be a non-negative number' };
    }
    if (contributionAt !== 'start' && contributionAt !== 'end') {
      return { ok: false, error: "contributionAt must be 'start' or 'end'" };
    }

    const n = compoundsPerYear;
    const totalPeriods = Math.round(n * years);
    const periodicRate = annualRate / 100 / n;
    const contributionPerPeriod = (monthlyContribution ?? 0) * (12 / n);

    let balance = principal;
    const schedule: CompoundInterestSchedulePoint[] = [];

    for (let period = 1; period <= totalPeriods; period++) {
      if (contributionAt === 'start') {
        balance += contributionPerPeriod;
      }
      balance *= 1 + periodicRate;
      if (contributionAt === 'end') {
        balance += contributionPerPeriod;
      }
      schedule.push({ period, balance: round2(balance) });
    }

    const totalContributions = principal + (monthlyContribution ?? 0) * 12 * years;
    const futureValue = round2(balance);
    const totalInterest = round2(futureValue - totalContributions);

    return {
      ok: true,
      data: {
        futureValue,
        totalContributions: round2(totalContributions),
        totalInterest,
        schedule,
      },
      mimeType: 'application/json',
    };
  },
};

export default tool;
