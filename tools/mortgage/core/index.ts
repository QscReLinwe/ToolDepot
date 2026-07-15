import type { ToolOutput } from '@tooldepot/types';

export interface MortgageInput {
  /** Home price or total loan amount. If downPayment is given, this is the home price. */
  principal: number;
  /** Annual nominal interest rate in percent (e.g. 6 for 6%). */
  annualRate: number;
  /** Loan term in years. */
  years: number;
  /** Optional upfront down payment; loan amount = principal - downPayment. */
  downPayment?: number;
  /** Optional extra amount applied to principal every month. */
  extraMonthly?: number;
}

export interface MortgageAmortizationRow {
  month: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface MortgageOutput {
  monthlyPayment: number;
  totalPaid: number;
  totalInterest: number;
  payoffMonths: number;
  amortization?: MortgageAmortizationRow[];
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export const tool = {
  id: 'mortgage',
  name: '房贷 / 车贷计算器',
  description: '计算月供、总利息与还款计划。',
  category: 'finance',
  async run(input: MortgageInput): Promise<ToolOutput<MortgageOutput>> {
    const principal = input?.principal;
    const annualRate = input?.annualRate;
    const years = input?.years;
    const downPayment = input?.downPayment;
    const extraMonthly = input?.extraMonthly;

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
      downPayment !== undefined &&
      (typeof downPayment !== 'number' || !Number.isFinite(downPayment) || downPayment < 0)
    ) {
      return { ok: false, error: 'downPayment must be a non-negative number' };
    }
    if (downPayment !== undefined && downPayment > principal) {
      return { ok: false, error: 'downPayment cannot exceed principal' };
    }
    if (
      extraMonthly !== undefined &&
      (typeof extraMonthly !== 'number' || !Number.isFinite(extraMonthly) || extraMonthly < 0)
    ) {
      return { ok: false, error: 'extraMonthly must be a non-negative number' };
    }

    const loanAmount = principal - (downPayment ?? 0);
    const monthlyRate = annualRate / 100 / 12;
    const numPayments = Math.round(years * 12);

    let monthlyPayment: number;
    if (monthlyRate === 0) {
      monthlyPayment = loanAmount / numPayments;
    } else {
      monthlyPayment = (loanAmount * monthlyRate) / (1 - (1 + monthlyRate) ** -numPayments);
    }
    monthlyPayment = round2(monthlyPayment);

    let balance = loanAmount;
    let paidLoan = 0;
    let payoffMonths = 0;
    const amortization: MortgageAmortizationRow[] = [];
    const extra = extraMonthly ?? 0;

    for (let month = 1; month <= numPayments + 1; month++) {
      if (balance <= 0) {
        payoffMonths = month - 1;
        break;
      }
      const interest = balance * monthlyRate;
      const scheduledPrincipal = monthlyPayment - interest;
      const payment = monthlyPayment + extra;

      if (payment >= balance + interest) {
        const finalPayment = balance + interest;
        paidLoan += finalPayment;
        balance = 0;
        payoffMonths = month;
        amortization.push({
          month,
          principal: round2(balance),
          interest: round2(interest),
          balance: 0,
        });
        break;
      }

      balance -= scheduledPrincipal + extra;
      paidLoan += payment;
      payoffMonths = month;
      amortization.push({
        month,
        principal: round2(scheduledPrincipal + extra),
        interest: round2(interest),
        balance: round2(Math.max(balance, 0)),
      });
    }

    const totalPaid = round2((downPayment ?? 0) + paidLoan);
    const totalInterest = round2(paidLoan - loanAmount);

    return {
      ok: true,
      data: {
        monthlyPayment,
        totalPaid,
        totalInterest,
        payoffMonths,
        amortization,
      },
      mimeType: 'application/json',
    };
  },
};

export default tool;
