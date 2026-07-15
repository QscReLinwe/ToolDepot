import type { ToolViewProps } from '@tooldepot/types';
import type React from 'react';
import { useId, useState } from 'react';
import type { MortgageInput, MortgageOutput } from '../core/index.js';

export const Component: React.FC<ToolViewProps<MortgageInput, MortgageOutput>> = ({ tool, initialInput, onResult }) => {
  const [principal, setPrincipal] = useState<string>(String(initialInput?.principal ?? ''));
  const [annualRate, setAnnualRate] = useState<string>(String(initialInput?.annualRate ?? ''));
  const [years, setYears] = useState<string>(String(initialInput?.years ?? ''));
  const [downPayment, setDownPayment] = useState<string>(String(initialInput?.downPayment ?? ''));
  const [extraMonthly, setExtraMonthly] = useState<string>(String(initialInput?.extraMonthly ?? ''));
  const [result, setResult] = useState<MortgageOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const idPrincipal = useId();
  const idAnnualRate = useId();
  const idYears = useId();
  const idDownPayment = useId();
  const idExtraMonthly = useId();

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const out = await tool.run({
        principal: Number(principal),
        annualRate: Number(annualRate),
        years: Number(years),
        downPayment: downPayment.trim() ? Number(downPayment) : undefined,
        extraMonthly: extraMonthly.trim() ? Number(extraMonthly) : undefined,
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

  return (
    <div className="tool-card" style={{ padding: 20, maxWidth: 600 }}>
      <h3 style={{ marginBottom: 16 }}>房贷计算器</h3>
      <div style={{ display: 'grid', gap: 12, maxWidth: 500 }}>
        <div>
          <label htmlFor={idPrincipal} style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
            房价 / 贷款金额
          </label>
          <input
            id={idPrincipal}
            className="tool-input"
            type="number"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            style={{ width: '100%', fontSize: 15, padding: '10px 12px' }}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label htmlFor={idAnnualRate} style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              年利率(%)
            </label>
            <input
              id={idAnnualRate}
              className="tool-input"
              type="number"
              value={annualRate}
              onChange={(e) => setAnnualRate(e.target.value)}
              style={{ width: '100%', fontSize: 15, padding: '10px 12px' }}
            />
          </div>
          <div>
            <label htmlFor={idYears} style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              期限（年）
            </label>
            <input
              id={idYears}
              className="tool-input"
              type="number"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              style={{ width: '100%', fontSize: 15, padding: '10px 12px' }}
            />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label htmlFor={idDownPayment} style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              首付
            </label>
            <input
              id={idDownPayment}
              className="tool-input"
              type="number"
              value={downPayment}
              onChange={(e) => setDownPayment(e.target.value)}
              style={{ width: '100%', fontSize: 15, padding: '10px 12px' }}
            />
          </div>
          <div>
            <label htmlFor={idExtraMonthly} style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              每月额外还款
            </label>
            <input
              id={idExtraMonthly}
              className="tool-input"
              type="number"
              value={extraMonthly}
              onChange={(e) => setExtraMonthly(e.target.value)}
              style={{ width: '100%', fontSize: 15, padding: '10px 12px' }}
            />
          </div>
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
                <strong>月供：</strong> {result.monthlyPayment}
              </div>
              <div>
                <strong>还款月数：</strong> {result.payoffMonths}
              </div>
              <div>
                <strong>总还款额：</strong> {result.totalPaid}
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
