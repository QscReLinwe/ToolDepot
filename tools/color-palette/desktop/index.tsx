import type { ToolViewProps } from '@tooldepot/types';
import type React from 'react';
import { useState } from 'react';
import type { ColorPaletteInput, ColorPaletteOutput, ColorScheme } from '../core/index.js';

const SCHEMES: ColorScheme[] = ['complementary', 'analogous', 'triadic', 'tetradic', 'monochromatic'];

export const Component: React.FC<ToolViewProps<ColorPaletteInput, ColorPaletteOutput>> = ({
  tool,
  initialInput,
  onResult,
}) => {
  const [baseColor, setBaseColor] = useState<string>(initialInput?.baseColor || '#3b82f6');
  const [scheme, setScheme] = useState<ColorScheme>(initialInput?.scheme || 'triadic');
  const [result, setResult] = useState<ColorPaletteOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const run = async () => {
    setError(null);
    const out = await tool.run({ baseColor, scheme });
    if (out.ok && out.data) {
      setResult(out.data);
    } else {
      setError(out.error || '未知错误');
      setResult(null);
    }
    onResult?.(out);
  };

  const copy = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopied(hex);
      setTimeout(() => setCopied(null), 1200);
    } catch {
      setCopied(null);
    }
  };

  return (
    <div className="tool-card" style={{ padding: 20, maxWidth: 640 }}>
      <h3 style={{ marginBottom: 16 }}>调色板</h3>

      <div style={{ display: 'grid', gap: 14, maxWidth: 520 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 12, alignItems: 'center' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              基础颜色
              <input
                type="color"
                className="tool-input"
                value={/^#[0-9a-f]{6}$/i.test(baseColor) ? baseColor : '#3b82f6'}
                onChange={(e) => setBaseColor(e.target.value)}
                style={{
                  width: 56,
                  height: 44,
                  padding: 2,
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              />
            </label>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              十六进制
              <input
                className="tool-input"
                value={baseColor}
                onChange={(e) => setBaseColor(e.target.value)}
                placeholder="#3b82f6"
                style={{ width: '100%', fontSize: 15, padding: '10px 12px', fontFamily: 'monospace' }}
              />
            </label>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
            配色方案
            <select
              className="tool-select"
              value={scheme}
              onChange={(e) => setScheme(e.target.value as ColorScheme)}
              style={{ width: '100%', fontSize: 15, padding: '10px 12px' }}
            >
              {SCHEMES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 12 }}>
              {result.colors.map((c) => (
                <button
                  type="button"
                  key={c.hex}
                  onClick={() => copy(c.hex)}
                  title="点击复制十六进制值"
                  style={{
                    cursor: 'pointer',
                    border: '1px solid #e5e7eb',
                    borderRadius: 8,
                    overflow: 'hidden',
                    background: '#fff',
                    padding: 0,
                    textAlign: 'left',
                  }}
                >
                  <div style={{ height: 64, background: c.hex }} />
                  <div style={{ padding: '8px 10px' }}>
                    <div style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 600 }}>{c.hex}</div>
                    <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#64748b' }}>{c.hsl}</div>
                  </div>
                </button>
              ))}
            </div>
            {copied && <div style={{ marginTop: 10, fontSize: 13, color: '#16a34a' }}>已复制 {copied} 到剪贴板</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default Component;
