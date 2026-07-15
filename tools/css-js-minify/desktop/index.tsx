import type { ToolViewProps } from '@tooldepot/types';
import type React from 'react';
import { useState } from 'react';
import type { CssJsMinifyInput, CssJsMinifyOutput, MinifyMode } from '../core/index.js';

export const Component: React.FC<ToolViewProps<CssJsMinifyInput, CssJsMinifyOutput>> = ({
  tool,
  initialInput,
  onResult,
}) => {
  const [mode, setMode] = useState<MinifyMode>(initialInput?.mode || 'css');
  const [code, setCode] = useState<string>(
    initialInput?.code || 'body {\n  color: red;\n  margin: 0;\n}\n\n/* comment */\n',
  );
  const [result, setResult] = useState<CssJsMinifyOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!code.trim()) {
      setError('请输入代码');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const out = await tool.run({ mode, code });
      if (out.ok && out.data) {
        setResult(out.data);
      } else {
        setError(out.error || '未知错误');
      }
      onResult?.(out);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    if (result?.minified) navigator.clipboard?.writeText(result.minified);
  };

  return (
    <div className="tool-card" style={{ padding: 20, maxWidth: 720 }}>
      <h3 style={{ marginBottom: 16 }}>CSS/JS 压缩工具</h3>

      <div style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['css', 'js'] as MinifyMode[]).map((m) => (
            <button
              type="button"
              key={m}
              className="tool-btn"
              onClick={() => setMode(m)}
              style={{
                padding: '8px 18px',
                background: mode === m ? '#2563eb' : '#e2e8f0',
                color: mode === m ? '#fff' : '#334155',
              }}
            >
              {m.toUpperCase()}
            </button>
          ))}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
            代码
            <textarea
              className="tool-input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={8}
              style={{ width: '100%', fontSize: 14, padding: '10px 12px', fontFamily: 'monospace', resize: 'vertical' }}
            />
          </label>
        </div>

        <button
          type="button"
          className="tool-btn"
          onClick={run}
          disabled={loading || !code.trim()}
          style={{ marginTop: 4 }}
        >
          {loading ? '压缩中...' : '压缩'}
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
          <div className="tool-result" style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontWeight: 500 }}>
                压缩后 — {result.originalBytes} → {result.minifiedBytes} 字节（节省 {result.savedPercent}%）
              </span>
              <button type="button" className="tool-btn" style={{ padding: '4px 10px', fontSize: 13 }} onClick={copy}>
                复制
              </button>
            </div>
            <pre
              style={{
                margin: 0,
                padding: 12,
                background: '#f8fafc',
                borderRadius: 6,
                fontFamily: 'monospace',
                fontSize: 13,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {result.minified}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default Component;
