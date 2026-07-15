import type { ToolViewProps } from '@tooldepot/types';
import type React from 'react';
import { useState } from 'react';
import type { PersonalBudgetInput, PersonalBudgetOutput } from '../core/index.js';

export const Component: React.FC<ToolViewProps<PersonalBudgetInput, PersonalBudgetOutput>> = ({
  tool,
  initialInput,
}) => {
  const [incomeText, setIncomeText] = useState<string>(
    initialInput?.income ? JSON.stringify(initialInput.income, null, 2) : '[{"name":"工资","amount":4000}]',
  );
  const [expensesText, setExpensesText] = useState<string>(
    initialInput?.expenses
      ? JSON.stringify(initialInput.expenses, null, 2)
      : '[{"name":"房租","amount":1500,"category":"住房"}]',
  );
  const [result, setResult] = useState<PersonalBudgetOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    setError(null);

    let income: { name: string; amount: number }[];
    let expenses: { name: string; amount: number; category?: string }[];

    try {
      income = JSON.parse(incomeText);
    } catch {
      setError('收入 JSON 解析失败');
      setLoading(false);
      return;
    }

    try {
      expenses = JSON.parse(expensesText);
    } catch {
      setError('支出 JSON 解析失败');
      setLoading(false);
      return;
    }

    try {
      const out = await tool.run({ income, expenses });
      if (out.ok && out.data) {
        setResult(out.data);
      } else {
        setError(out.error ?? '未知错误');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const textArea = (label: string, id: string, value: string, onChange: (v: string) => void) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }} htmlFor={id}>
        {label}
      </label>
      <textarea
        className="tool-input"
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        style={{ width: '100%', fontSize: 14, padding: '10px 12px', fontFamily: 'monospace' }}
      />
    </div>
  );

  return (
    <div className="tool-card" style={{ padding: 20, maxWidth: 600 }}>
      <h3 style={{ marginBottom: 16 }}>个人预算计算器</h3>

      {textArea('收入列表 (JSON 数组)', 'pb-income', incomeText, setIncomeText)}
      {textArea('支出列表 (JSON 数组)', 'pb-expenses', expensesText, setExpensesText)}

      <button type="button" className="tool-btn" onClick={run} disabled={loading} style={{ marginTop: 8 }}>
        {loading ? '计算中...' : '计算'}
      </button>

      {error && (
        <div
          className="tool-error"
          style={{ color: '#dc2626', marginTop: 12, padding: 12, background: '#fef2f2', borderRadius: 6 }}
        >
          {error}
        </div>
      )}

      {result && (
        <div className="tool-result" style={{ marginTop: 16, padding: 12, background: '#f8fafc', borderRadius: 6 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 14, marginBottom: 8 }}>
            <div>
              <strong>收入</strong> {result.totalIncome}
            </div>
            <div>
              <strong>支出</strong> {result.totalExpense}
            </div>
            <div>
              <strong>结余</strong> {result.balance}
            </div>
            <div>
              <strong>储蓄率：</strong> {result.savingsRate}%
            </div>
          </div>
          <div style={{ fontSize: 13 }}>
            <div style={{ fontWeight: 500, marginBottom: 4 }}>按类别</div>
            {result.byCategory.map((c) => (
              <div key={c.category} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{c.category}</span>
                <span>{c.amount}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Component;
