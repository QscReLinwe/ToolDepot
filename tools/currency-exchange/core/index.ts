import type { Tool, ToolOutput } from '@tooldepot/types';

export interface CurrencyExchangeInput {
  amount: number;
  /** ISO 4217 code of the source currency, e.g. 'USD'. */
  from?: string;
  /** ISO 4217 code of the target currency, e.g. 'EUR'. */
  to?: string;
  /** Optional rate table: units of each currency per 1 USD. Falls back to a built-in sample table. */
  rates?: Record<string, number>;
}

export interface CurrencyExchangeOutput {
  amount: number;
  from: string;
  to: string;
  /** Conversion rate from -> to (i.e. 1 unit of `from` equals `rate` units of `to`). */
  rate: number;
  converted: number;
}

/**
 * Built-in SAMPLE rates — units of each currency per 1 USD.
 * Clearly approximate and for offline/demo use only; pass `rates` for live values.
 */
export const SAMPLE_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  CNY: 7.24,
  JPY: 156.0,
  GBP: 0.79,
  INR: 83.0,
  CAD: 1.36,
  AUD: 1.52,
  CHF: 0.89,
  KRW: 1370.0,
};

function round6(n: number): number {
  return Math.round((n + Number.EPSILON) * 1e6) / 1e6;
}

export const tool: Tool<CurrencyExchangeInput, CurrencyExchangeOutput> = {
  id: 'currency-exchange',
  name: '汇率换算',
  description: '按汇率表在货币间换算金额。',
  category: 'finance',
  async run(input: CurrencyExchangeInput): Promise<ToolOutput<CurrencyExchangeOutput>> {
    const amount = input?.amount;
    const from = input?.from;
    const to = input?.to;
    const rates = input?.rates ?? SAMPLE_RATES;

    if (typeof amount !== 'number' || !Number.isFinite(amount) || amount < 0) {
      return { ok: false, error: 'amount must be a non-negative number' };
    }
    if (typeof from !== 'string' || from.trim() === '') {
      return { ok: false, error: 'from must be a non-empty currency code' };
    }
    if (typeof to !== 'string' || to.trim() === '') {
      return { ok: false, error: 'to must be a non-empty currency code' };
    }
    if (typeof rates !== 'object' || rates === null) {
      return { ok: false, error: 'rates must be a record of currency code to rate' };
    }

    const fromCode = from.trim().toUpperCase();
    const toCode = to.trim().toUpperCase();

    const fromRate = rates[fromCode];
    const toRate = rates[toCode];

    if (typeof fromRate !== 'number' || !Number.isFinite(fromRate) || fromRate <= 0) {
      return { ok: false, error: `Unknown or invalid rate for currency: ${fromCode}` };
    }
    if (typeof toRate !== 'number' || !Number.isFinite(toRate) || toRate <= 0) {
      return { ok: false, error: `Unknown or invalid rate for currency: ${toCode}` };
    }

    const rate = round6(toRate / fromRate);
    const converted = round6(amount * rate);

    return {
      ok: true,
      data: {
        amount,
        from: fromCode,
        to: toCode,
        rate,
        converted,
      },
      mimeType: 'application/json',
    };
  },
};

export default tool;
