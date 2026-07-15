import type { ToolViewProps } from '@tooldepot/types';
import type React from 'react';
import { useState } from 'react';
import type { LifeCategory, UnitConverterLifeInput, UnitConverterLifeOutput } from '../core/index.js';

const CATEGORIES: { id: LifeCategory; label: string; units: string[] }[] = [
  { id: 'cooking', label: '烹饪', units: ['cup', 'tbsp', 'tsp', 'ml', 'oz', 'g', 'lb', 'kg'] },
  { id: 'length', label: '长度', units: ['inch', 'ft', 'yd', 'mile', 'cm', 'm', 'km'] },
  { id: 'area', label: '面积', units: ['sqft', 'sqm'] },
];

export const Component: React.FC<ToolViewProps<UnitConverterLifeInput, UnitConverterLifeOutput>> = ({
  tool,
  initialInput,
  onResult,
}) => {
  const [category, setCategory] = useState<LifeCategory>(initialInput?.category ?? 'cooking');
  const [from, setFrom] = useState<string>(initialInput?.from ?? 'cup');
  const [to, setTo] = useState<string>(initialInput?.to ?? 'ml');
  const [value, setValue] = useState<string>(initialInput?.value?.toString() ?? '');
  const [result, setResult] = useState<UnitConverterLifeOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const units = CATEGORIES.find((c) => c.id === category)?.units ?? [];

  const onCategoryChange = (cat: LifeCategory) => {
    setCategory(cat);
    const u = CATEGORIES.find((c) => c.id === cat)?.units ?? [];
    setFrom(u[0] ?? '');
    setTo(u[1] ?? u[0] ?? '');
  };

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const out = await tool.run({
        category,
        from,
        to,
        value: value ? Number(value) : undefined,
      });
      if (out.ok && out.data) {
        setResult(out.data);
        onResult?.(out);
      } else {
        setError(out.error ?? '未知错误');
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
      <h3 style={{ marginBottom: 16 }}>生活单位换算</h3>

      <div style={{ display: 'grid', gap: 12, maxWidth: 500 }}>
        <div>
          <label htmlFor="ucl-category" style={labelStyle}>
            类别
          </label>
          <select
            id="ucl-category"
            className="tool-select"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value as LifeCategory)}
            style={inputStyle}
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label htmlFor="ucl-from" style={labelStyle}>
              从
            </label>
            <select
              id="ucl-from"
              className="tool-select"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              style={inputStyle}
            >
              {units.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="ucl-to" style={labelStyle}>
              到
            </label>
            <select
              id="ucl-to"
              className="tool-select"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              style={inputStyle}
            >
              {units.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="ucl-value" style={labelStyle}>
            数值
          </label>
          <input
            id="ucl-value"
            className="tool-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="例如 2"
            style={inputStyle}
          />
        </div>

        <button type="button" className="tool-btn" onClick={run} disabled={loading} style={{ marginTop: 8 }}>
          {loading ? '换算中..' : '换算'}
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
            <div style={{ fontSize: 20, fontWeight: 600, fontFamily: 'monospace' }}>
              {result.value} {result.from} = {result.result} {result.to}
            </div>
            {result.formula && <div style={{ fontSize: 13, color: '#64748b', marginTop: 6 }}>{result.formula}</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default Component;
