import type { ToolViewProps } from '@tooldepot/types';
import type React from 'react';
import { useState } from 'react';
import type { FontPreviewInput, FontPreviewOutput } from '../core/index.js';

export const Component: React.FC<ToolViewProps<FontPreviewInput, FontPreviewOutput>> = ({
  tool,
  initialInput,
  onResult,
}) => {
  const [text, setText] = useState<string>(initialInput?.text || 'The quick brown fox');
  const [result, setResult] = useState<FontPreviewOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setError(null);
    const out = await tool.run({ text });
    if (out.ok && out.data) {
      setResult(out.data);
    } else {
      setError(out.error || 'Unknown error');
      setResult(null);
    }
    onResult?.(out);
  };

  return (
    <div className="tool-card" style={{ padding: 20, maxWidth: 640 }}>
      <h3 style={{ marginBottom: 16 }}>字体预览</h3>

      <div style={{ display: 'grid', gap: 14, maxWidth: 560 }}>
        <div>
          <label htmlFor="fp-text" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
            预览文本
          </label>
          <input
            id="fp-text"
            className="tool-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="快速的棕色狐狸"
            style={{ width: '100%', fontSize: 15, padding: '10px 12px' }}
          />
        </div>

        <button type="button" className="tool-btn" onClick={run} style={{ marginTop: 4 }}>
          预览
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
          <div className="tool-result" style={{ marginTop: 12, display: 'grid', gap: 10 }}>
            {result.fonts.map((font) => (
              <div
                key={font}
                style={{
                  padding: '12px 14px',
                  background: '#f8fafc',
                  borderRadius: 6,
                  border: '1px solid #e5e7eb',
                }}
              >
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4, fontFamily: 'monospace' }}>{font}</div>
                <div style={{ fontSize: 22, lineHeight: 1.3, fontFamily: `'${font}', sans-serif` }}>{result.text}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Component;
