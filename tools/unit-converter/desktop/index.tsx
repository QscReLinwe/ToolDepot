import type { ToolViewProps } from '@tooldepot/types';
import type React from 'react';
import { useState } from 'react';
import type { UnitCategory, UnitConverterInput, UnitConverterOutput } from '../core/index.js';

const CATEGORIES: { id: UnitCategory; units: string[] }[] = [
  { id: 'length', units: ['mm', 'cm', 'm', 'km', 'in', 'ft', 'yd', 'mi'] },
  { id: 'mass', units: ['mg', 'g', 'kg', 't', 'oz', 'lb'] },
  { id: 'temperature', units: ['C', 'F', 'K'] },
  { id: 'area', units: ['mm2', 'cm2', 'm2', 'km2', 'ha', 'ac', 'ft2', 'in2', 'mi2'] },
  { id: 'volume', units: ['ml', 'l', 'm3', 'cm3', 'gal', 'qt', 'pt', 'cup', 'floz', 'ukgal'] },
  { id: 'speed', units: ['mps', 'kph', 'mph', 'fps', 'knot'] },
  { id: 'data', units: ['b', 'B', 'KB', 'MB', 'GB', 'TB', 'KiB', 'MiB', 'GiB', 'TiB'] },
  { id: 'time', units: ['ms', 's', 'min', 'h', 'day', 'week'] },
  { id: 'pressure', units: ['pa', 'kpa', 'mpa', 'bar', 'atm', 'psi', 'torr'] },
];

function unitsFor(category: UnitCategory): string[] {
  return CATEGORIES.find((c) => c.id === category)?.units ?? [];
}

export const Component: React.FC<ToolViewProps<UnitConverterInput, UnitConverterOutput>> = ({
  tool,
  initialInput,
  onResult,
}) => {
  const CATEGORY_LABELS: Record<UnitCategory, string> = {
    length: '长度',
    mass: '质量',
    temperature: '温度',
    area: '面积',
    volume: '体积',
    speed: '速度',
    data: '数据',
    time: '时间',
    pressure: '压强',
  };

  const [category, setCategory] = useState<UnitCategory>(initialInput?.category || 'length');
  const [from, setFrom] = useState<string>(initialInput?.from || 'km');
  const [to, setTo] = useState<string>(initialInput?.to || 'mi');
  const [value, setValue] = useState<number>(initialInput?.value ?? 1);
  const [result, setResult] = useState<UnitConverterOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const units = unitsFor(category);

  const onCategoryChange = (cat: UnitCategory) => {
    const u = unitsFor(cat);
    setCategory(cat);
    setFrom(u[0] ?? '');
    setTo(u[1] ?? u[0] ?? '');
  };

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const out = await tool.run({ category, from, to, value });
      if (out.ok && out.data) {
        setResult(out.data);
      } else {
        setError(out.error || '未知错误');
        setResult(null);
      }
      onResult?.(out);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tool-card" style={{ padding: 20, maxWidth: 640 }}>
      <h3 style={{ marginBottom: 16 }}>单位换算</h3>

      <div style={{ display: 'grid', gap: 12 }}>
        <div>
          <label htmlFor="uc-category" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
            类别
          </label>
          <select
            id="uc-category"
            className="tool-select"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value as UnitCategory)}
            style={{ width: '100%', fontSize: 15, padding: '10px 12px' }}
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {CATEGORY_LABELS[c.id]}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 12, alignItems: 'end' }}>
          <div>
            <label htmlFor="uc-from" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              从
            </label>
            <select
              id="uc-from"
              className="tool-select"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              style={{ width: '100%', fontSize: 15, padding: '10px 12px' }}
            >
              {units.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
          <div style={{ paddingBottom: 10, color: '#64748b' }}>→</div>
          <div>
            <label htmlFor="uc-to" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              到
            </label>
            <select
              id="uc-to"
              className="tool-select"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              style={{ width: '100%', fontSize: 15, padding: '10px 12px' }}
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
          <label htmlFor="uc-value" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
            数值
          </label>
          <input
            id="uc-value"
            className="tool-input"
            type="number"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
            style={{ width: '100%', fontSize: 15, padding: '10px 12px' }}
          />
        </div>

        <button type="button" className="tool-btn" onClick={run} disabled={loading} style={{ marginTop: 4 }}>
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
          <div className="tool-result" style={{ marginTop: 16, padding: 16, background: '#f8fafc', borderRadius: 6 }}>
            <div style={{ fontSize: 22, fontWeight: 600, fontFamily: 'monospace' }}>
              {result.result} {result.to}
            </div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
              {result.value} {result.from} = {result.result} {result.to}
              {result.formula ? `  ·  ${result.formula}` : ''}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Component;
