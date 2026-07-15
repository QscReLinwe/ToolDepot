import type { ToolViewProps } from '@tooldepot/types';
import type React from 'react';
import { useState } from 'react';
import type { ErrorCorrection, QrCodeInput, QrCodeOutput } from '../core/index.js';

const ECC: ErrorCorrection[] = ['L', 'M', 'Q', 'H'];

export const Component: React.FC<ToolViewProps<QrCodeInput, QrCodeOutput>> = ({ tool, initialInput, onResult }) => {
  const [text, setText] = useState<string>(initialInput?.text || 'https://example.com');
  const [size, setSize] = useState<number>(initialInput?.size ?? 256);
  const [errorCorrection, setErrorCorrection] = useState<ErrorCorrection>(initialInput?.errorCorrection || 'M');
  const [margin, setMargin] = useState<number>(initialInput?.margin ?? 4);
  const [result, setResult] = useState<QrCodeOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!text.trim()) {
      setError('请输入文本或网址');
      return;
    }
    setLoading(true);
    setError(null);
    const out = await tool.run({ text, size, errorCorrection, margin });
    if (out.ok && out.data) {
      setResult(out.data);
    } else {
      setError(out.error || '未知错误');
      setResult(null);
    }
    onResult?.(out);
    setLoading(false);
  };

  const download = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result.dataUrl;
    a.download = 'qrcode.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="tool-card" style={{ padding: 20, maxWidth: 560 }}>
      <h3 style={{ marginBottom: 16 }}>二维码生成器</h3>

      <div style={{ display: 'grid', gap: 14, maxWidth: 480 }}>
        <div>
          <label htmlFor="qr-text" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
            文本或网址
          </label>
          <input
            id="qr-text"
            className="tool-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="https://example.com"
            style={{ width: '100%', fontSize: 15, padding: '10px 12px' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <div>
            <label htmlFor="qr-size" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              尺寸（像素）
            </label>
            <input
              id="qr-size"
              className="tool-input"
              type="number"
              min={32}
              max={4096}
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              style={{ width: '100%', fontSize: 15, padding: '10px 12px' }}
            />
          </div>
          <div>
            <label htmlFor="qr-ecc" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              纠错等级
            </label>
            <select
              id="qr-ecc"
              className="tool-select"
              value={errorCorrection}
              onChange={(e) => setErrorCorrection(e.target.value as ErrorCorrection)}
              style={{ width: '100%', fontSize: 15, padding: '10px 12px' }}
            >
              {ECC.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="qr-margin" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              边距
            </label>
            <input
              id="qr-margin"
              className="tool-input"
              type="number"
              min={0}
              max={40}
              value={margin}
              onChange={(e) => setMargin(Number(e.target.value))}
              style={{ width: '100%', fontSize: 15, padding: '10px 12px' }}
            />
          </div>
        </div>

        <button type="button" className="tool-btn" onClick={run} disabled={loading} style={{ marginTop: 4 }}>
          {loading ? '生成中…' : '生成'}
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
          <div className="tool-result" style={{ marginTop: 12, display: 'grid', justifyContent: 'center', gap: 12 }}>
            <div
              style={{
                padding: 16,
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                display: 'inline-flex',
              }}
            >
              <img
                src={result.dataUrl}
                alt="二维码"
                width={size > 320 ? 320 : size}
                height={size > 320 ? 320 : size}
                style={{ display: 'block' }}
              />
            </div>
            <button
              type="button"
              className="tool-btn"
              onClick={download}
              style={{ background: '#dcfce7', color: '#15803d' }}
            >
              下载 PNG
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Component;
