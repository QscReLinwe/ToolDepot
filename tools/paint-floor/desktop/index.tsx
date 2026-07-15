import type { ToolViewProps } from '@tooldepot/types';
import type React from 'react';
import { useState } from 'react';
import type { PaintFloorInput, PaintFloorOutput } from '../core/index.js';

export const Component: React.FC<ToolViewProps<PaintFloorInput, PaintFloorOutput>> = ({
  tool,
  initialInput,
  onResult,
}) => {
  const [mode, setMode] = useState<'paint' | 'floor'>(initialInput?.mode ?? 'paint');
  const [areaSqm, setAreaSqm] = useState<string>(initialInput?.areaSqm?.toString() ?? '');
  const [lengthM, setLengthM] = useState<string>(initialInput?.lengthM?.toString() ?? '');
  const [widthM, setWidthM] = useState<string>(initialInput?.widthM?.toString() ?? '');
  const [coats, setCoats] = useState<string>(initialInput?.coats?.toString() ?? '2');
  const [coveragePerL, setCoveragePerL] = useState<string>(initialInput?.coveragePerL?.toString() ?? '10');
  const [floorBoxSqm, setFloorBoxSqm] = useState<string>(initialInput?.floorBoxSqm?.toString() ?? '2.0');
  const [wastePercent, setWastePercent] = useState<string>(initialInput?.wastePercent?.toString() ?? '10');
  const [result, setResult] = useState<PaintFloorOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const out = await tool.run({
        mode,
        areaSqm: areaSqm ? Number(areaSqm) : undefined,
        lengthM: lengthM ? Number(lengthM) : undefined,
        widthM: widthM ? Number(widthM) : undefined,
        coats: coats ? Number(coats) : undefined,
        coveragePerL: coveragePerL ? Number(coveragePerL) : undefined,
        floorBoxSqm: floorBoxSqm ? Number(floorBoxSqm) : undefined,
        wastePercent: wastePercent ? Number(wastePercent) : undefined,
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
      <h3 style={{ marginBottom: 16 }}>油漆与地板计算器</h3>

      <div style={{ display: 'grid', gap: 12, maxWidth: 500 }}>
        <div>
          <label style={labelStyle} htmlFor="pf-mode">
            模式
          </label>
          <select
            className="tool-select"
            id="pf-mode"
            value={mode}
            onChange={(e) => setMode(e.target.value as 'paint' | 'floor')}
            style={inputStyle}
          >
            <option value="paint">油漆</option>
            <option value="floor">地板</option>
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle} htmlFor="pf-area">
              面积（m²）
            </label>
            <input
              className="tool-input"
              id="pf-area"
              value={areaSqm}
              onChange={(e) => setAreaSqm(e.target.value)}
              placeholder="例如 50"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle} htmlFor="pf-waste">
              损耗（%）
            </label>
            <input
              className="tool-input"
              id="pf-waste"
              value={wastePercent}
              onChange={(e) => setWastePercent(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle} htmlFor="pf-length">
              长度（m）
            </label>
            <input
              className="tool-input"
              id="pf-length"
              value={lengthM}
              onChange={(e) => setLengthM(e.target.value)}
              placeholder="可选"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle} htmlFor="pf-width">
              宽度（m）
            </label>
            <input
              className="tool-input"
              id="pf-width"
              value={widthM}
              onChange={(e) => setWidthM(e.target.value)}
              placeholder="可选"
              style={inputStyle}
            />
          </div>
        </div>

        {mode === 'paint' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle} htmlFor="pf-coats">
                涂刷遍数
              </label>
              <input
                className="tool-input"
                id="pf-coats"
                value={coats}
                onChange={(e) => setCoats(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle} htmlFor="pf-coverage">
                覆盖率（L/m²）
              </label>
              <input
                className="tool-input"
                id="pf-coverage"
                value={coveragePerL}
                onChange={(e) => setCoveragePerL(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>
        ) : (
          <div>
            <label style={labelStyle} htmlFor="pf-floorbox">
              地板箱面积（m²/箱）
            </label>
            <input
              className="tool-input"
              id="pf-floorbox"
              value={floorBoxSqm}
              onChange={(e) => setFloorBoxSqm(e.target.value)}
              style={inputStyle}
            />
          </div>
        )}

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
              面积：<b>{result.areaSqm} m²</b>
            </div>
            {result.paintLiters !== undefined && (
              <div style={{ fontSize: 14, marginTop: 6 }}>
                油漆：<b>{result.paintLiters.toFixed(2)} L</b>（含损耗：{result.withWaste.toFixed(2)} L）{' '}
              </div>
            )}
            {result.floorBoxes !== undefined && (
              <div style={{ fontSize: 14, marginTop: 6 }}>
                箱数：<b>{result.floorBoxes}</b>（含损耗：{result.withWaste}）{' '}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Component;
