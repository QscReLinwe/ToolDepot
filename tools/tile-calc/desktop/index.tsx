import type { ToolViewProps } from '@tooldepot/types';
import type React from 'react';
import { useState } from 'react';
import type { TileCalcInput, TileCalcOutput } from '../core/index.js';

export const Component: React.FC<ToolViewProps<TileCalcInput, TileCalcOutput>> = ({ tool, initialInput, onResult }) => {
  const [areaSqm, setAreaSqm] = useState<string>(initialInput?.areaSqm?.toString() ?? '');
  const [tileLengthCm, setTileLengthCm] = useState<string>(initialInput?.tileLengthCm?.toString() ?? '');
  const [tileWidthCm, setTileWidthCm] = useState<string>(initialInput?.tileWidthCm?.toString() ?? '');
  const [groutMm, setGroutMm] = useState<string>(initialInput?.groutMm?.toString() ?? '0');
  const [wastePercent, setWastePercent] = useState<string>(initialInput?.wastePercent?.toString() ?? '10');
  const [boxSize, setBoxSize] = useState<string>(initialInput?.boxSize?.toString() ?? '');
  const [result, setResult] = useState<TileCalcOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const out = await tool.run({
        areaSqm: areaSqm ? Number(areaSqm) : undefined,
        tileLengthCm: tileLengthCm ? Number(tileLengthCm) : undefined,
        tileWidthCm: tileWidthCm ? Number(tileWidthCm) : undefined,
        groutMm: groutMm ? Number(groutMm) : undefined,
        wastePercent: wastePercent ? Number(wastePercent) : undefined,
        boxSize: boxSize ? Number(boxSize) : undefined,
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
      <h3 style={{ marginBottom: 16 }}>瓷砖计算器</h3>

      <div style={{ display: 'grid', gap: 12, maxWidth: 500 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label htmlFor="tc-area" style={labelStyle}>
              面积（m²）
            </label>
            <input
              id="tc-area"
              className="tool-input"
              value={areaSqm}
              onChange={(e) => setAreaSqm(e.target.value)}
              placeholder="例如 20"
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="tc-waste" style={labelStyle}>
              损耗（%）
            </label>
            <input
              id="tc-waste"
              className="tool-input"
              value={wastePercent}
              onChange={(e) => setWastePercent(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label htmlFor="tc-length" style={labelStyle}>
              瓷砖长度（cm）
            </label>
            <input
              id="tc-length"
              className="tool-input"
              value={tileLengthCm}
              onChange={(e) => setTileLengthCm(e.target.value)}
              placeholder="例如 30"
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="tc-width" style={labelStyle}>
              瓷砖宽度（cm）
            </label>
            <input
              id="tc-width"
              className="tool-input"
              value={tileWidthCm}
              onChange={(e) => setTileWidthCm(e.target.value)}
              placeholder="例如 30"
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label htmlFor="tc-grout" style={labelStyle}>
              填缝剂（mm）
            </label>
            <input
              id="tc-grout"
              className="tool-input"
              value={groutMm}
              onChange={(e) => setGroutMm(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="tc-box" style={labelStyle}>
              每箱瓷砖数（可选）
            </label>
            <input
              id="tc-box"
              className="tool-input"
              value={boxSize}
              onChange={(e) => setBoxSize(e.target.value)}
              placeholder="可选"
              style={inputStyle}
            />
          </div>
        </div>

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
            <div style={{ fontSize: 14, color: '#64748b' }}>
              瓷砖面积（含填缝）：<b>{result.tileAreaSqm.toFixed(4)} m²</b>
            </div>
            <div style={{ fontSize: 14, marginTop: 6 }}>
              所需瓷砖数：<b>{result.tilesNeeded}</b>
            </div>
            <div style={{ fontSize: 14, marginTop: 6 }}>
              含损耗：<b>{result.tilesWithWaste}</b>
            </div>
            {result.boxes !== undefined && (
              <div style={{ fontSize: 14, marginTop: 6 }}>
                箱数：<b>{result.boxes}</b>（每箱{result.boxSize} 块）
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Component;
