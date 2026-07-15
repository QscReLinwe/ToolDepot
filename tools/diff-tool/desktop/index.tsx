import type { ToolViewProps } from '@tooldepot/types';
import type React from 'react';
import { useState } from 'react';
import type { DiffToolInput, DiffToolOutput } from '../core/index.js';

const MODES: DiffToolInput['mode'][] = ['line', 'char'];

export const Component: React.FC<ToolViewProps<DiffToolInput, DiffToolOutput>> = ({ tool, initialInput, onResult }) => {
  const [a, setA] = useState<string>(initialInput?.a || '');
  const [b, setB] = useState<string>(initialInput?.b || '');
  const [mode, setMode] = useState<DiffToolInput['mode']>(initialInput?.mode || 'line');
  const [ignoreWs, setIgnoreWs] = useState<boolean>(initialInput?.ignoreWhitespace ?? false);
  const [result, setResult] = useState<DiffToolOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const out = await tool.run({ a, b, mode, ignoreWhitespace: ignoreWs });
      if (out.ok && out.data) {
        setResult(out.data);
      } else {
        setError(out.error || 'Unknown error');
        setResult(null);
      }
      onResult?.(out);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const _sep = mode === 'line' ? '\n' : '';

  return (
    <div className="tool-card" style={{ padding: 20, maxWidth: 820 }}>
      <h3 style={{ marginBottom: 16 }}>文本对比工具</h3>

      <div style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {MODES.map((m) => (
              <button
                type="button"
                key={m}
                className="tool-btn"
                onClick={() => setMode(m)}
                style={{ background: mode === m ? '#2563eb' : '#e2e8f0', color: mode === m ? '#fff' : '#1e293b' }}
              >
                {m === 'line' ? '行' : '字符'}
              </button>
            ))}
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500, marginLeft: 'auto' }}>
            <input type="checkbox" checked={ignoreWs} onChange={(e) => setIgnoreWs(e.target.checked)} />
            忽略空白字符
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              原文（A）
              <textarea
                className="tool-input"
                value={a}
                onChange={(e) => setA(e.target.value)}
                rows={8}
                placeholder="原始文本"
                style={{
                  width: '100%',
                  fontSize: 14,
                  padding: '10px 12px',
                  fontFamily: 'monospace',
                  resize: 'vertical',
                }}
              />
            </label>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              修改后（B）
              <textarea
                className="tool-input"
                value={b}
                onChange={(e) => setB(e.target.value)}
                rows={8}
                placeholder="修改后的文本"
                style={{
                  width: '100%',
                  fontSize: 14,
                  padding: '10px 12px',
                  fontFamily: 'monospace',
                  resize: 'vertical',
                }}
              />
            </label>
          </div>
        </div>

        <button type="button" className="tool-btn" onClick={run} disabled={loading} style={{ marginTop: 4 }}>
          {loading ? '对比中...' : '对比'}
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
          <div className="tool-result" style={{ marginTop: 16 }}>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>
              <span style={{ color: '#16a34a', fontWeight: 600 }}>+{result.additions} 处新增</span>
              {' · '}
              <span style={{ color: '#dc2626', fontWeight: 600 }}>-{result.deletions} 处删除</span>
              {' · '}
              <span>{result.unchanged} 处未变</span>
            </div>
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: 13,
                background: '#0f172a',
                color: '#e2e8f0',
                padding: 12,
                borderRadius: 6,
                whiteSpace: 'pre-wrap',
                maxHeight: 360,
                overflow: 'auto',
              }}
            >
              {result.hunks.map((h) => {
                const color = h.type === 'add' ? '#4ade80' : h.type === 'del' ? '#f87171' : '#94a3b8';
                const prefix = h.type === 'add' ? '+ ' : h.type === 'del' ? '- ' : '  ';
                return (
                  <div key={h.text} style={{ color }}>
                    {h.text.split('\n').map((l) => (
                      <div key={prefix + l}>{prefix + l}</div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Component;
