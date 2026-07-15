import type { ToolOutput } from '@tooldepot/types';

export interface BudgetEntry {
  name: string;
  amount: number;
  category?: string;
}

export interface PersonalBudgetInput {
  income: BudgetEntry[];
  expenses: BudgetEntry[];
}

export interface CategoryTotal {
  category: string;
  amount: number;
}

export interface PersonalBudgetOutput {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  savingsRate: number;
  byCategory: CategoryTotal[];
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export const tool = {
  id: 'personal-budget',
  name: '个人预算',
  description: '汇总收入、支出、结余、储蓄率与分类明细',
  category: 'finance',
  async run(input: PersonalBudgetInput): Promise<ToolOutput<PersonalBudgetOutput>> {
    const income = input?.income;
    const expenses = input?.expenses;

    if (!Array.isArray(income)) {
      return { ok: false, error: 'income 必须是 { name, amount } 数组' };
    }
    if (!Array.isArray(expenses)) {
      return { ok: false, error: 'expenses 必须是 { name, amount, category? } 数组' };
    }

    for (const item of [...income, ...expenses]) {
      if (typeof item?.amount !== 'number' || !Number.isFinite(item.amount) || item.amount < 0) {
        return { ok: false, error: '每条记录必须包含非负数字 amount' };
      }
    }

    const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
    const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
    const balance = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0;

    const categoryMap = new Map<string, number>();
    for (const item of expenses) {
      const category = item.category?.trim() ? item.category.trim() : '未分类';
      categoryMap.set(category, (categoryMap.get(category) ?? 0) + item.amount);
    }
    const byCategory: CategoryTotal[] = Array.from(categoryMap.entries())
      .map(([category, amount]) => ({ category, amount: round2(amount) }))
      .sort((a, b) => b.amount - a.amount);

    return {
      ok: true,
      data: {
        totalIncome: round2(totalIncome),
        totalExpense: round2(totalExpense),
        balance: round2(balance),
        savingsRate: round2(savingsRate),
        byCategory,
      },
      mimeType: 'application/json',
    };
  },
};

export default tool;
