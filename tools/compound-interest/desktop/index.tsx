import type { ToolViewProps } from '@tooldepot/types';
import type React from 'react';
import { useState } from 'react';
import type { CompoundInterestInput, CompoundInterestOutput } from '../core/index.js';

export const Component: React.FC<ToolViewProps<CompoundInterestInput, CompoundInterestOutput>> = ({
  tool,
  initialInput,
  onResult,
}) => {
  const [principal, setPrincipal] = useState<string>(String(initialInput?.principal ?? ''));
  const [annualRate, setAnnualRate] = useState<string>(String(initialInput?.annualRate ?? ''));
  const [years, setYears] = useState<string>(String(initialInput?.years ?? ''));
  const [compoundsPerYear, setCompoundsPerYear] = useState<string>(String(initialInput?.compoundsPerYear ?? '12'));
  const [monthlyContribution, setMonthlyContribution] = useState<string>(
    String(initialInput?.monthlyContribution ?? ''),
  );
  const [contributionAt, setContributionAt] = useState<'start' | 'end'>(initialInput?.contributionAt ?? 'end');
  const [result, setResult] = useState<CompoundInterestOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const out = await tool.run({
        principal: Number(principal),
        annualRate: Number(annualRate),
        years: Number(years),
        compoundsPerYear: Number(compoundsPerYear),
        monthlyContribution: monthlyContribution.trim() ? Number(monthlyContribution) : undefined,
        contributionAt,
      });
      if (out.ok && out.data) {
        setResult(out.data);
        onResult?.(out);
      } else {
        setError(out.error || '未知错误');
        setResult(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const num = (v: string) => (v.trim() === '' ? '' : v);

  return (
    <div className="tool-card" style={{ padding: 20, maxWidth: 600 }}>
      <h3 style={{ marginBottom: 16 }}>复利计算</h3>
      <div style={{ display: 'grid', gap: 12, maxWidth: 500 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
            本金
            <input
              className="tool-input"
              type="number"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              style={{ width: '100%', fontSize: 15, padding: '10px 12px' }}
            />
          </label>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              年利率（%）
              <input
                className="tool-input"
                type="number"
                value={annualRate}
                onChange={(e) => setAnnualRate(e.target.value)}
                style={{ width: '100%', fontSize: 15, padding: '10px 12px' }}
              />
            </label>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              年数
              <input
                className="tool-input"
                type="number"
                value={years}
                onChange={(e) => setYears(e.target.value)}
                style={{ width: '100%', fontSize: 15, padding: '10px 12px' }}
              />
            </label>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              每年复利次数
              <select
                className="tool-select"
                value={compoundsPerYear}
                onChange={(e) => setCompoundsPerYear(e.target.value)}
                style={{ width: '100%', fontSize: 15, padding: '10px 12px' }}
              >
                <option value="1">1（每年）</option>
                <option value="4">4（每季度）</option>
                <option value="12">12（每月）</option>
                <option value="365">365（每天）</option>
              </select>
            </label>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              每月定投
              <input
                className="tool-input"
                type="number"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(e.target.value)}
                style={{ width: '100%', fontSize: 15, padding: '10px 12px' }}
              />
            </label>
          </div>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
            定投时点
            <select
              className="tool-select"
              value={contributionAt}
              onChange={(e) => setContributionAt(e.target.value as 'start' | 'end')}
              style={{ width: '100%', fontSize: 15, padding: '10px 12px' }}
            >
              <option value="end">期末</option>
              <option value="start">期初</option>
            </select>
          </label>
        </div>

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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 14 }}>
              <div>
                <strong>未来价值：</strong> {num(String(result.futureValue))}
              </div>
              <div>
                <strong>总投入：</strong> {result.totalContributions}
              </div>
              <div>
                <strong>总利息：</strong> {result.totalInterest}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Component;
