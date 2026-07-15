import type { ToolViewProps } from '@tooldepot/types';
import type React from 'react';
import { useState } from 'react';
import type { CurtainCalcInput, CurtainCalcOutput } from '../core/index.js';

export const Component: React.FC<ToolViewProps<CurtainCalcInput, CurtainCalcOutput>> = ({
  tool,
  initialInput,
  onResult,
}) => {
  const [windowWidthCm, setWindowWidthCm] = useState<string>(initialInput?.windowWidthCm?.toString() ?? '');
  const [windowHeightCm, setWindowHeightCm] = useState<string>(initialInput?.windowHeightCm?.toString() ?? '');
  const [fullness, setFullness] = useState<string>(initialInput?.fullness?.toString() ?? '2.0');
  const [hemCm, setHemCm] = useState<string>(initialInput?.hemCm?.toString() ?? '15');
  const [fabricWidthCm, setFabricWidthCm] = useState<string>(initialInput?.fabricWidthCm?.toString() ?? '140');
  const [result, setResult] = useState<CurtainCalcOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const out = await tool.run({
        windowWidthCm: windowWidthCm ? Number(windowWidthCm) : undefined,
        windowHeightCm: windowHeightCm ? Number(windowHeightCm) : undefined,
        fullness: fullness ? Number(fullness) : undefined,
        hemCm: hemCm ? Number(hemCm) : undefined,
        fabricWidthCm: fabricWidthCm ? Number(fabricWidthCm) : undefined,
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
      <h3 style={{ marginBottom: 16 }}>窗帘计算器</h3>

      <div style={{ display: 'grid', gap: 12, maxWidth: 500 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>
              窗宽（厘米）
              <input
                className="tool-input"
                value={windowWidthCm}
                onChange={(e) => setWindowWidthCm(e.target.value)}
                placeholder="例如 200"
                style={inputStyle}
              />
            </label>
          </div>
          <div>
            <label style={labelStyle}>
              窗高（厘米）
              <input
                className="tool-input"
                value={windowHeightCm}
                onChange={(e) => setWindowHeightCm(e.target.value)}
                placeholder="例如 250"
                style={inputStyle}
              />
            </label>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>
              褶皱倍数
              <input
                className="tool-input"
                value={fullness}
                onChange={(e) => setFullness(e.target.value)}
                style={inputStyle}
              />
            </label>
          </div>
          <div>
            <label style={labelStyle}>
              下摆（厘米）
              <input
                className="tool-input"
                value={hemCm}
                onChange={(e) => setHemCm(e.target.value)}
                style={inputStyle}
              />
            </label>
          </div>
        </div>

        <div>
          <label style={labelStyle}>
            布料幅宽（厘米）
            <input
              className="tool-input"
              value={fabricWidthCm}
              onChange={(e) => setFabricWidthCm(e.target.value)}
              style={inputStyle}
            />
          </label>
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
              布料总宽：<b>{result.fabricWidthCm.toFixed(1)} 厘米</b>
            </div>
            <div style={{ fontSize: 14, marginTop: 6 }}>
              每片布料长度：<b>{result.fabricLengthCm.toFixed(1)} 厘米</b>
            </div>
            <div style={{ fontSize: 14, marginTop: 6 }}>
              所需片数：<b>{result.panels}</b>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Component;
