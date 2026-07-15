import type { ToolViewProps } from '@tooldepot/types';
import type React from 'react';
import { useState } from 'react';
import type { DateCalcInput, DateCalcMode, DateCalcOutput } from '../core/index.js';

const MODES: DateCalcMode[] = ['add', 'subtract', 'diff', 'weekday'];

export const Component: React.FC<ToolViewProps<DateCalcInput, DateCalcOutput>> = ({ tool, initialInput, onResult }) => {
  const [mode, setMode] = useState<DateCalcMode>(initialInput?.mode || 'add');
  const [startDate, setStartDate] = useState<string>(initialInput?.startDate || '');
  const [endDate, setEndDate] = useState<string>(initialInput?.endDate || '');
  const [days, setDays] = useState<string>(String(initialInput?.days ?? ''));
  const [months, setMonths] = useState<string>(String(initialInput?.months ?? ''));
  const [years, setYears] = useState<string>(String(initialInput?.years ?? ''));
  const [countWorkdays, setCountWorkdays] = useState<boolean>(initialInput?.countWorkdays || false);
  const [result, setResult] = useState<DateCalcOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const out = await tool.run({
        mode,
        startDate,
        endDate: endDate || undefined,
        days: days ? Number(days) : undefined,
        months: months ? Number(months) : undefined,
        years: years ? Number(years) : undefined,
        countWorkdays,
      });
      if (out.ok && out.data) {
        setResult(out.data);
      } else {
        setError(out.error || 'Unknown error');
      }
      onResult?.(out);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const numField = (label: string, value: string, setter: (v: string) => void, placeholder: string) => (
    <div>
      <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
        {label}
        <input
          className="tool-input"
          type="number"
          value={value}
          onChange={(e) => setter(e.target.value)}
          placeholder={placeholder}
          style={{ width: '100%', fontSize: 15, padding: '10px 12px', marginTop: 4 }}
        />
      </label>
    </div>
  );

  return (
    <div className="tool-card" style={{ padding: 20, maxWidth: 600 }}>
      <h3 style={{ marginBottom: 16 }}>日期计算器</h3>

      <div style={{ display: 'grid', gap: 12, maxWidth: 500 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
            模式
            <select
              className="tool-select"
              value={mode}
              onChange={(e) => setMode(e.target.value as DateCalcMode)}
              style={{ width: '100%', fontSize: 15, padding: '10px 12px' }}
            >
              {MODES.map((m) => (
                <option key={m} value={m}>
                  {m === 'add' ? '加' : m === 'subtract' ? '减' : m === 'diff' ? '相差' : '星期'}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
            开始日期（ISO）
            <input
              className="tool-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="2024-01-01"
              style={{ width: '100%', fontSize: 15, padding: '10px 12px', marginTop: 4 }}
            />
          </label>
        </div>

        {mode === 'diff' && (
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              结束日期（ISO）
              <input
                className="tool-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="2024-12-31"
                style={{ width: '100%', fontSize: 15, padding: '10px 12px', marginTop: 4 }}
              />
            </label>
          </div>
        )}

        {(mode === 'add' || mode === 'subtract') && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            {numField('天数', days, setDays, '0')}
            {numField('月数', months, setMonths, '0')}
            {numField('年数', years, setYears, '0')}
          </div>
        )}

        {mode === 'diff' && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
            <input type="checkbox" checked={countWorkdays} onChange={(e) => setCountWorkdays(e.target.checked)} />
            同时计算工作日（周一至周五）
          </label>
        )}

        <button
          type="button"
          className="tool-btn"
          onClick={run}
          disabled={loading || !startDate.trim()}
          style={{ marginTop: 8 }}
        >
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
            <div style={{ fontSize: 18, fontWeight: 600, fontFamily: 'monospace', marginBottom: 8 }}>
              {result.result}
            </div>
            <div style={{ display: 'grid', gap: 4, fontSize: 14, color: '#334155' }}>
              {result.weekday && <div>星期：{result.weekday}</div>}
              {result.diffDays !== undefined && <div>相差：{result.diffDays} 天</div>}
              {result.diffWorkdays !== undefined && <div>工作日：{result.diffWorkdays}</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Component;
