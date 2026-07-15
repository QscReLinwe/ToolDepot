import type { ToolViewProps } from '@tooldepot/types';
import type React from 'react';
import { useState } from 'react';
import type { EntityMode, HtmlEntityInput, HtmlEntityOutput } from '../core/index.js';

const MODE_LABELS: Record<EntityMode, string> = {
  encode: '编码',
  decode: '解码',
};

export const Component: React.FC<ToolViewProps<HtmlEntityInput, HtmlEntityOutput>> = ({
  tool,
  initialInput,
  onResult,
}) => {
  const [mode, setMode] = useState<EntityMode>(initialInput?.mode || 'encode');
  const [text, setText] = useState<string>(initialInput?.text || 'Tom & Jerry <3 "quoted"');
  const [named, setNamed] = useState<boolean>(initialInput?.named ?? true);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!text.trim()) {
      setError('请输入一些文本');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const out = await tool.run({ mode, text, named });
      if (out.ok && out.data) {
        setResult(out.data.result);
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
    if (result) navigator.clipboard?.writeText(result);
  };

  return (
    <div className="tool-card" style={{ padding: 20, maxWidth: 720 }}>
      <h3 style={{ marginBottom: 16 }}>HTML 实体编码工具</h3>

      <div style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['encode', 'decode'] as EntityMode[]).map((m) => (
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
              {MODE_LABELS[m]}
            </button>
          ))}
        </div>

        {mode === 'encode' && (
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 14 }}>
            <input type="checkbox" checked={named} onChange={(e) => setNamed(e.target.checked)} />
            使用命名实体（否则使用数字实体）
          </label>
        )}

        <div>
          <label htmlFor="he-text" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
            文本
          </label>
          <textarea
            id="he-text"
            className="tool-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            style={{ width: '100%', fontSize: 14, padding: '10px 12px', fontFamily: 'monospace', resize: 'vertical' }}
          />
        </div>

        <button
          type="button"
          className="tool-btn"
          onClick={run}
          disabled={loading || !text.trim()}
          style={{ marginTop: 4 }}
        >
          {loading ? '处理中...' : '运行'}
        </button>

        {error && (
          <div
            className="tool-error"
            style={{ color: '#dc2626', marginTop: 12, padding: 12, background: '#fef2f2', borderRadius: 6 }}
          >
            {error}
          </div>
        )}

        {result !== null && (
          <div className="tool-result" style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontWeight: 500 }}>结果</span>
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
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default Component;
