import type { Tool, ToolOutput } from '@tooldepot/types';

export interface CompoundInterestInput {
  /** Initial lump sum. */
  principal: number;
  /** Annual nominal interest rate in percent (e.g. 5 for 5%). */
  annualRate: number;
  /** Number of years. */
  years: number;
  /** Compounding frequency per year: 1, 4, 12, or 365. */
  compoundsPerYear: number;
  /**
   * Fixed contribution expressed as a monthly amount. It is converted to a
   * per-compounding-period amount (contribution frequency = compounding
   * frequency) via `monthlyContribution * (12 / compoundsPerYear)`.
   */
  monthlyContribution?: number;
  /** Whether the contribution is applied at the start or end of each compounding period. */
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

export const tool: Tool<CompoundInterestInput, CompoundInterestOutput> = {
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
    // Periods may be fractional for non-integer years (e.g. 2.5 years at
    // monthly compounding = 30 periods). We use the exact exponential formula
    // instead of an integer loop so fractional periods are handled precisely.
    const periods = n * years;
    const periodicRate = annualRate / 100 / n;
    // Contribution frequency defaults to the compounding frequency. The input
    // is a monthly amount, so convert it to a per-period amount.
    const contributionPerPeriod = (monthlyContribution ?? 0) * (12 / n);

    const growth = (1 + periodicRate) ** periods;

    // Future value of the initial principal: P * (1 + r)^periods
    const fvPrincipal = principal * growth;

    // Future value of the contributions (ordinary annuity / annuity due).
    let fvContributions: number;
    if (periodicRate === 0) {
      fvContributions = contributionPerPeriod * periods;
    } else {
      const annuityFactor = (growth - 1) / periodicRate;
      fvContributions = contributionPerPeriod * annuityFactor * (contributionAt === 'start' ? 1 + periodicRate : 1);
    }

    const futureValue = round2(fvPrincipal + fvContributions);
    const totalContributions = round2(principal + contributionPerPeriod * periods);
    const totalInterest = round2(futureValue - totalContributions);

    // Schedule: exact per-integer-period recurrence, plus a final point at the
    // exact future value when the total period count is fractional.
    const schedule: CompoundInterestSchedulePoint[] = [];
    let balance = principal;
    const fullPeriods = Math.floor(periods);
    for (let period = 1; period <= fullPeriods; period++) {
      if (contributionAt === 'start') {
        balance += contributionPerPeriod;
      }
      balance *= 1 + periodicRate;
      if (contributionAt === 'end') {
        balance += contributionPerPeriod;
      }
      schedule.push({ period, balance: round2(balance) });
    }
    if (fullPeriods < periods) {
      schedule.push({ period: round2(periods), balance: futureValue });
    }

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
