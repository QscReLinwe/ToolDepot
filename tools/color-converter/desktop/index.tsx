import type { ToolViewProps } from '@tooldepot/types';
import type React from 'react';
import { useState } from 'react';
import type { ColorConverterInput, ColorConverterOutput, ColorFormat } from '../core/index.js';

const FORMATS: Array<{ key: keyof ColorConverterOutput; label: string }> = [
  { key: 'hex', label: 'HEX' },
  { key: 'rgb', label: 'RGB' },
  { key: 'hsl', label: 'HSL' },
  { key: 'hsv', label: 'HSV' },
  { key: 'cmyk', label: 'CMYK' },
];

export const Component: React.FC<ToolViewProps<ColorConverterInput, ColorConverterOutput>> = ({
  tool,
  initialInput,
  onResult,
}) => {
  const [input, setInput] = useState<string>(initialInput?.input ?? '#3388ff');
  const [from, setFrom] = useState<ColorFormat>(initialInput?.from ?? 'auto');
  const [result, setResult] = useState<ColorConverterOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const run = async (value: string) => {
    setError(null);
    const out = await tool.run({ input: value, from });
    if (out.ok && out.data) {
      setResult(out.data);
    } else {
      setError(out.error ?? '未知错误');
      setResult(null);
    }
    onResult?.(out);
  };

  const copy = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(null), 1200);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="tool-card" style={{ padding: 20, maxWidth: 600 }}>
      <h3 style={{ marginBottom: 16 }}>颜色转换器</h3>

      <div style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: 10 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              颜色
              <input
                className="tool-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="#3388ff or rgb(51,136,255)"
                style={{ width: '100%', fontFamily: 'monospace', padding: '10px 12px' }}
              />
            </label>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              源格式
              <select
                className="tool-select"
                value={from}
                onChange={(e) => setFrom(e.target.value as ColorFormat)}
                style={{ width: '100%', padding: '10px 12px' }}
              >
                <option value="auto">自动</option>
                <option value="hex">hex</option>
                <option value="rgb">rgb</option>
                <option value="hsl">hsl</option>
                <option value="hsv">hsv</option>
                <option value="cmyk">cmyk</option>
              </select>
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            type="color"
            value={result?.hex ?? '#3388ff'}
            onChange={(e) => {
              setInput(e.target.value);
              void run(e.target.value);
            }}
            style={{ width: 48, height: 36, padding: 0, border: 'none', background: 'none', cursor: 'pointer' }}
          />
          <button type="button" className="tool-btn" onClick={() => void run(input)}>
            转换
          </button>
        </div>

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
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div
                style={{ width: 56, height: 56, borderRadius: 8, border: '1px solid #e2e8f0', background: result.hex }}
              />
              <div style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 600 }}>{result.hex}</div>
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              {FORMATS.map((f) => (
                <div key={f.key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 56, color: '#64748b', fontSize: 13 }}>{f.label}</span>
                  <code style={{ flex: 1, fontFamily: 'monospace', fontSize: 13, wordBreak: 'break-all' }}>
                    {result[f.key]}
                  </code>
                  <button
                    type="button"
                    className="tool-btn"
                    style={{ padding: '4px 10px', fontSize: 12 }}
                    onClick={() => void copy(f.key, result[f.key])}
                  >
                    {copied === f.key ? '已复制' : '复制'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Component;
