import type { ToolViewProps } from '@tooldepot/types';
import type React from 'react';
import { useState } from 'react';
import type { ElectricityCostInput, ElectricityCostOutput } from '../core/index.js';

export const Component: React.FC<ToolViewProps<ElectricityCostInput, ElectricityCostOutput>> = ({
  tool,
  initialInput,
  onResult,
}) => {
  const [powerW, setPowerW] = useState<string>(initialInput?.powerW?.toString() ?? '');
  const [hoursPerDay, setHoursPerDay] = useState<string>(initialInput?.hoursPerDay?.toString() ?? '');
  const [days, setDays] = useState<string>(initialInput?.days?.toString() ?? '30');
  const [pricePerKwh, setPricePerKwh] = useState<string>(initialInput?.pricePerKwh?.toString() ?? '');
  const [currency, setCurrency] = useState<string>(initialInput?.currency ?? '');
  const [result, setResult] = useState<ElectricityCostOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const out = await tool.run({
        powerW: powerW ? Number(powerW) : undefined,
        hoursPerDay: hoursPerDay ? Number(hoursPerDay) : undefined,
        days: days ? Number(days) : undefined,
        pricePerKwh: pricePerKwh ? Number(pricePerKwh) : undefined,
        currency: currency || undefined,
      });
      if (out.ok && out.data) {
        setResult(out.data);
        onResult?.(out);
      } else {
        setError(out.error ?? 'Unknown error');
        setResult(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const labelStyle: React.CSSProperties = { display: 'block', marginBottom: 4, fontWeight: 500 };
  const inputStyle: React.CSSProperties = { width: '100%', fontSize: 15, padding: '10px 12px', marginTop: 4 };

  return (
    <div className="tool-card" style={{ padding: 20, maxWidth: 600 }}>
      <h3 style={{ marginBottom: 16 }}>电费计算</h3>

      <div style={{ display: 'grid', gap: 12, maxWidth: 500 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle} htmlFor="powerW">
              功率（瓦）
            </label>
            <input
              id="powerW"
              className="tool-input"
              value={powerW}
              onChange={(e) => setPowerW(e.target.value)}
              placeholder="例如 1500"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle} htmlFor="hoursPerDay">
              每天小时）
            </label>
            <input
              id="hoursPerDay"
              className="tool-input"
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(e.target.value)}
              placeholder="例如 3"
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle} htmlFor="days">
              天数
            </label>
            <input
              id="days"
              className="tool-input"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle} htmlFor="pricePerKwh">
              单价 / 千瓦时
            </label>
            <input
              id="pricePerKwh"
              className="tool-input"
              value={pricePerKwh}
              onChange={(e) => setPricePerKwh(e.target.value)}
              placeholder="例如 0.30"
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <label style={labelStyle} htmlFor="currency">
            货币符号（可选）
          </label>
          <input
            id="currency"
            className="tool-input"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            placeholder="例如 ¥"
            style={inputStyle}
          />
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
            <div style={{ fontSize: 14, color: '#64748b' }}>
              每日耗<b>{result.dailyKwh.toFixed(3)} 千瓦时</b>
            </div>
            <div style={{ fontSize: 14, marginTop: 6 }}>
              总计耗<b>{result.totalKwh.toFixed(2)} 千瓦时</b> · {result.cost.toFixed(2)}
              {currency}
            </div>
            <div style={{ fontSize: 14, marginTop: 6 }}>
              每月（0天）约{' '}
              <b>
                {result.monthlyCost?.toFixed(2)}
                {currency}
              </b>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Component;
