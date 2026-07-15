import type { ToolViewProps } from '@tooldepot/types';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import type { GradientGenInput, GradientGenOutput, GradientStop, GradientType } from '../core/index.js';

export const Component: React.FC<ToolViewProps<GradientGenInput, GradientGenOutput>> = ({
  tool,
  initialInput,
  onResult,
}) => {
  const [type, setType] = useState<GradientType>(initialInput?.type || 'linear');
  const [angle, setAngle] = useState<number>(initialInput?.angle ?? 90);
  const [stops, setStops] = useState<GradientStop[]>(
    initialInput?.stops && initialInput.stops.length >= 2
      ? initialInput.stops
      : [
          { color: '#3b82f6', position: 0 },
          { color: '#8b5cf6', position: 100 },
        ],
  );
  const [result, setResult] = useState<GradientGenOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout>>();

  const updateStop = (i: number, patch: Partial<GradientStop>) => {
    setStops((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  };

  const addStop = () => {
    setStops((prev) => [...prev, { color: '#22c55e', position: 50 }]);
  };

  const removeStop = (i: number) => {
    setStops((prev) => (prev.length <= 2 ? prev : prev.filter((_, idx) => idx !== i)));
  };

  const run = async () => {
    setError(null);
    const out = await tool.run({ type, angle, stops });
    if (out.ok && out.data) {
      setResult(out.data);
    } else {
      setError(out.error || '未知错误');
      setResult(null);
    }
    onResult?.(out);
  };

  const copy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.css);
      setCopied(true);
      copyTimer.current = setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  useEffect(() => {
    return () => clearTimeout(copyTimer.current);
  }, []);

  const previewCss =
    type === 'linear'
      ? `linear-gradient(${Math.round(angle)}deg, ${stops
          .map((s) => `${s.color} ${Math.round(s.position)}%`)
          .join(', ')})`
      : `radial-gradient(circle, ${stops.map((s) => `${s.color} ${Math.round(s.position)}%`).join(', ')})`;

  return (
    <div className="tool-card" style={{ padding: 20, maxWidth: 640 }}>
      <h3 style={{ marginBottom: 16 }}>渐变生成器</h3>

      <div style={{ display: 'grid', gap: 14, maxWidth: 560 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label htmlFor="type" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              类型
            </label>
            <select
              id="type"
              className="tool-select"
              value={type}
              onChange={(e) => setType(e.target.value as GradientType)}
              style={{ width: '100%', fontSize: 15, padding: '10px 12px' }}
            >
              <option value="linear">线性</option>
              <option value="radial">径向</option>
            </select>
          </div>
          <div>
            <label htmlFor="angle" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              角度: {Math.round(angle)}°
            </label>
            <input
              id="angle"
              type="range"
              min={0}
              max={360}
              value={angle}
              disabled={type !== 'linear'}
              onChange={(e) => setAngle(Number(e.target.value))}
              style={{ width: '100%', marginTop: 8 }}
            />
          </div>
        </div>

        <div>
          <label htmlFor="stop-0" style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>
            颜色节点
          </label>
          <div style={{ display: 'grid', gap: 8 }}>
            {stops.map((s, i) => (
              <div
                key={`${s.color}-${s.position}`}
                style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 80px auto', gap: 8, alignItems: 'center' }}
              >
                <input
                  id={i === 0 ? 'stop-0' : undefined}
                  type="color"
                  value={/^#[0-9a-f]{6}$/i.test(s.color) ? s.color : '#000000'}
                  onChange={(e) => updateStop(i, { color: e.target.value })}
                  style={{
                    width: 44,
                    height: 36,
                    padding: 2,
                    border: '1px solid #d1d5db',
                    borderRadius: 6,
                    cursor: 'pointer',
                  }}
                />
                <input
                  className="tool-input"
                  value={s.color}
                  onChange={(e) => updateStop(i, { color: e.target.value })}
                  placeholder="#3b82f6"
                  style={{ fontSize: 14, padding: '8px 10px', fontFamily: 'monospace' }}
                />
                <input
                  className="tool-input"
                  type="number"
                  min={0}
                  max={100}
                  value={Math.round(s.position)}
                  onChange={(e) => updateStop(i, { position: Number(e.target.value) })}
                  style={{ fontSize: 14, padding: '8px 10px' }}
                />
                <button
                  type="button"
                  className="tool-btn"
                  onClick={() => removeStop(i)}
                  disabled={stops.length <= 2}
                  style={{
                    padding: '8px 10px',
                    background: stops.length <= 2 ? '#e5e7eb' : '#fee2e2',
                    color: stops.length <= 2 ? '#9ca3af' : '#b91c1c',
                  }}
                  title="删除节点"
                >
                  删{' '}
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="tool-btn"
            onClick={addStop}
            style={{ marginTop: 8, background: '#e0e7ff', color: '#3730a3' }}
          >
            + 添加节点
          </button>
        </div>

        <button type="button" className="tool-btn" onClick={run} style={{ marginTop: 4 }}>
          生成
        </button>

        {error && (
          <div
            className="tool-error"
            style={{ color: '#dc2626', marginTop: 8, padding: 12, background: '#fef2f2', borderRadius: 6 }}
          >
            {error}
          </div>
        )}

        {result && (
          <div className="tool-result" style={{ marginTop: 12 }}>
            <div
              style={{
                height: 120,
                borderRadius: 8,
                border: '1px solid #e5e7eb',
                background: previewCss,
              }}
            />
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 10 }}>
              <code
                style={{
                  flex: 1,
                  fontFamily: 'monospace',
                  fontSize: 13,
                  background: '#f8fafc',
                  padding: '8px 10px',
                  borderRadius: 6,
                  overflowX: 'auto',
                }}
              >
                {result.css}
              </code>
              <button
                type="button"
                className="tool-btn"
                onClick={copy}
                style={{ background: '#dcfce7', color: '#15803d' }}
              >
                {copied ? '已复制！' : '复制 CSS'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Component;
