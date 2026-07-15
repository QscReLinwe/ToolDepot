import type { ToolOutput } from '@tooldepot/types';

export interface TipSplitInput {
  /** Pre-tip bill amount. */
  bill: number;
  /** Tip percentage (e.g. 15 for 15%). */
  tipPercent: number;
  /** Number of people to split among. */
  people: number;
  /** Round each person's share up to the next whole unit. */
  roundUp?: boolean;
  currency?: string;
}

export interface TipSplitOutput {
  tip: number;
  total: number;
  perPerson: number;
  perPersonRounded: number;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export const tool = {
  id: 'tip-split',
  name: '小费 / 分账计算器',
  description: '计算小费、总额与人均分摊。',
  category: 'finance',
  async run(input: TipSplitInput): Promise<ToolOutput<TipSplitOutput>> {
    const bill = input?.bill;
    const tipPercent = input?.tipPercent;
    const people = input?.people;
    const roundUp = input?.roundUp ?? false;

    if (typeof bill !== 'number' || !Number.isFinite(bill) || bill < 0) {
      return { ok: false, error: 'bill must be a non-negative number' };
    }
    if (typeof tipPercent !== 'number' || !Number.isFinite(tipPercent) || tipPercent < 0) {
      return { ok: false, error: 'tipPercent must be a non-negative number' };
    }
    if (typeof people !== 'number' || !Number.isFinite(people) || !Number.isInteger(people) || people < 1) {
      return { ok: false, error: 'people must be an integer of 1 or more' };
    }

    const tip = bill * (tipPercent / 100);
    const total = bill + tip;
    const perPerson = total / people;
    const perPersonRounded = roundUp ? Math.ceil(perPerson) : round2(perPerson);

    return {
      ok: true,
      data: {
        tip: round2(tip),
        total: round2(total),
        perPerson: round2(perPerson),
        perPersonRounded,
      },
      mimeType: 'application/json',
    };
  },
};

export default tool;
