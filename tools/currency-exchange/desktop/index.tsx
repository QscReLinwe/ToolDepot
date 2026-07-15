import type { ToolViewProps } from '@tooldepot/types';
import type React from 'react';
import { useState } from 'react';
import type { CurrencyExchangeInput, CurrencyExchangeOutput } from '../core/index.js';
import { SAMPLE_RATES } from '../core/index.js';

const CODES = Object.keys(SAMPLE_RATES);

export const Component: React.FC<ToolViewProps<CurrencyExchangeInput, CurrencyExchangeOutput>> = ({
  tool,
  initialInput,
  onResult,
}) => {
  const [amount, setAmount] = useState<string>(String(initialInput?.amount ?? ''));
  const [from, setFrom] = useState<string>(initialInput?.from ?? 'USD');
  const [to, setTo] = useState<string>(initialInput?.to ?? 'EUR');
  const [result, setResult] = useState<CurrencyExchangeOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const out = await tool.run({
        amount: Number(amount),
        from,
        to,
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
      <h3 style={{ marginBottom: 16 }}>货币换算</h3>
      <p style={{ fontSize: 12, color: '#64748b', marginTop: 0 }}>
        使用内置示例汇率（每 1 美元对应单位数）。如需实时汇率，请通过 API 提供汇率表。
      </p>
      <div style={{ display: 'grid', gap: 12, maxWidth: 500 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
            金额
            <input
              className="tool-input"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{ width: '100%', fontSize: 15, padding: '10px 12px' }}
            />
          </label>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              从
              <select
                className="tool-select"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                style={{ width: '100%', fontSize: 15, padding: '10px 12px' }}
              >
                {CODES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              到
              <select
                className="tool-select"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                style={{ width: '100%', fontSize: 15, padding: '10px 12px' }}
              >
                {CODES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <button type="button" className="tool-btn" onClick={run} disabled={loading} style={{ marginTop: 8 }}>
          {loading ? '转换中...' : '转换'}
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
            <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
              {result.converted} {result.to}
            </div>
            <div style={{ fontSize: 13, color: '#64748b' }}>
              {result.amount} {result.from} × {result.rate} = {result.converted} {result.to}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Component;
