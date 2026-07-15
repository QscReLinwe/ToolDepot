import type { ToolViewProps } from '@tooldepot/types';
import type React from 'react';
import { useId, useState } from 'react';
import type { LunarCalendarInput, LunarCalendarOutput } from '../core/index.js';

export const Component: React.FC<ToolViewProps<LunarCalendarInput, LunarCalendarOutput>> = ({
  tool,
  initialInput,
  onResult,
}) => {
  const [date, setDate] = useState<string>(initialInput?.date ?? '');
  const [result, setResult] = useState<LunarCalendarOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const dateFieldId = useId();

  const run = async () => {
    setError(null);
    if (!date) {
      setError('请输入公历日期');
      return;
    }
    const out = await tool.run({ date });
    if (out.ok && out.data) {
      setResult(out.data);
    } else {
      setError(out.error ?? '未知错误');
      setResult(null);
    }
    onResult?.(out);
  };

  const dateField = (label: string, value: string, onChange: (v: string) => void, id: string) => {
    return (
      <div style={{ marginBottom: 12 }}>
        <label htmlFor={id} style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
          {label}
        </label>
        <input
          id={id}
          className="tool-input"
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: '100%', fontSize: 15, padding: '10px 12px' }}
        />
      </div>
    );
  };

  return (
    <div className="tool-card" style={{ padding: 20, maxWidth: 500 }}>
      <h3 style={{ marginBottom: 16 }}>农历查询</h3>

      {dateField('公历日期', date, setDate, dateFieldId)}

      <button type="button" className="tool-btn" onClick={run} style={{ width: '100%', padding: '12px', fontSize: 16 }}>
        查询
      </button>

      {error && (
        <div style={{ color: '#dc2626', marginTop: 12, padding: 12, background: '#fef2f2', borderRadius: 6 }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: 16, padding: 16, background: '#f0fdf4', borderRadius: 8 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#166534', marginBottom: 12 }}>
            {result.lunarDate} {result.zodiac}年{' '}
          </div>
          <div style={{ fontSize: 14, color: '#374151', lineHeight: 2 }}>
            <div>
              干支年 <span style={{ fontWeight: 600 }}>{result.ganzhiYear}</span>
            </div>
            <div>
              干支月 <span style={{ fontWeight: 600 }}>{result.ganzhiMonth}</span>
            </div>
            <div>
              干支日 <span style={{ fontWeight: 600 }}>{result.ganzhiDay}</span>
            </div>
            {result.solarTerm && (
              <div>
                节气: <span style={{ fontWeight: 600 }}>{result.solarTerm}</span>
              </div>
            )}
            {result.nextSolarTerm && (
              <div>
                下一节气: <span style={{ fontWeight: 600 }}>{result.nextSolarTerm}</span>
              </div>
            )}
            {result.lunarFestival && (
              <div>
                农历节日: <span style={{ fontWeight: 600, color: '#dc2626' }}>{result.lunarFestival}</span>
              </div>
            )}
            {result.gregorianFestival && (
              <div>
                公历节日: <span style={{ fontWeight: 600, color: '#dc2626' }}>{result.gregorianFestival}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Component;
