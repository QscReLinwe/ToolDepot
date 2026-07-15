import type { ToolViewProps } from '@tooldepot/types';
import type React from 'react';
import { useState } from 'react';
import type { TipSplitInput, TipSplitOutput } from '../core/index.js';

export const Component: React.FC<ToolViewProps<TipSplitInput, TipSplitOutput>> = ({ tool, initialInput, onResult }) => {
  const [bill, setBill] = useState<string>(String(initialInput?.bill ?? ''));
  const [tipPercent, setTipPercent] = useState<string>(String(initialInput?.tipPercent ?? ''));
  const [people, setPeople] = useState<string>(String(initialInput?.people ?? '1'));
  const [roundUp, setRoundUp] = useState<boolean>(initialInput?.roundUp ?? false);
  const [currency, setCurrency] = useState<string>(String(initialInput?.currency ?? ''));
  const [result, setResult] = useState<TipSplitOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const out = await tool.run({
        bill: Number(bill),
        tipPercent: Number(tipPercent),
        people: Number(people),
        roundUp,
        currency: currency.trim() ? currency : undefined,
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
      <h3 style={{ marginBottom: 16 }}>小费分摊计算器</h3>
      <div style={{ display: 'grid', gap: 12, maxWidth: 500 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label htmlFor="ts-bill" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              账单金额
            </label>
            <input
              id="ts-bill"
              className="tool-input"
              type="number"
              value={bill}
              onChange={(e) => setBill(e.target.value)}
              style={{ width: '100%', fontSize: 15, padding: '10px 12px' }}
            />
          </div>
          <div>
            <label htmlFor="ts-tipPercent" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              小费比例 (%)
            </label>
            <input
              id="ts-tipPercent"
              className="tool-input"
              type="number"
              value={tipPercent}
              onChange={(e) => setTipPercent(e.target.value)}
              style={{ width: '100%', fontSize: 15, padding: '10px 12px' }}
            />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label htmlFor="ts-people" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              人数
            </label>
            <input
              id="ts-people"
              className="tool-input"
              type="number"
              value={people}
              onChange={(e) => setPeople(e.target.value)}
              style={{ width: '100%', fontSize: 15, padding: '10px 12px' }}
            />
          </div>
          <div>
            <label htmlFor="ts-currency" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              货币
            </label>
            <input
              id="ts-currency"
              className="tool-input"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              style={{ width: '100%', fontSize: 15, padding: '10px 12px' }}
            />
          </div>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}>
          <input type="checkbox" checked={roundUp} onChange={(e) => setRoundUp(e.target.checked)} />
          每人向上取整
        </label>

        <button type="button" className="tool-btn" onClick={run} disabled={loading} style={{ marginTop: 8 }}>
          {loading ? '计算中..' : '计算'}
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
                <strong>小费：</strong> {result.tip}
              </div>
              <div>
                <strong>总计：</strong> {result.total}
              </div>
              <div>
                <strong>每人：</strong> {result.perPerson}
              </div>
              <div>
                <strong>取整后：</strong> {result.perPersonRounded}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Component;
