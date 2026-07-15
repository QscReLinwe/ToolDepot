import type { ToolViewProps } from '@tooldepot/types';
import type React from 'react';
import { useState } from 'react';
import type { XmlJsonInput, XmlJsonOutput } from '../core/index.js';

const MODES: XmlJsonInput['mode'][] = ['xml2json', 'json2xml'];

export const Component: React.FC<ToolViewProps<XmlJsonInput, XmlJsonOutput>> = ({ tool, initialInput, onResult }) => {
  const [mode, setMode] = useState<XmlJsonInput['mode']>(initialInput?.mode || 'xml2json');
  const [text, setText] = useState<string>(initialInput?.text || '');
  const [result, setResult] = useState<XmlJsonOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const out = await tool.run({ mode, text });
      if (out.ok && out.data) {
        setResult(out.data);
      } else {
        setError(out.error || '未知错误');
        setResult(null);
      }
      onResult?.(out);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (result?.result) {
      await navigator.clipboard.writeText(result.result);
    }
  };

  return (
    <div className="tool-card" style={{ padding: 20, maxWidth: 720 }}>
      <h3 style={{ marginBottom: 16 }}>XML / JSON 转换器</h3>

      <div style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {MODES.map((m) => (
            <button
              type="button"
              key={m}
              className="tool-btn"
              onClick={() => setMode(m)}
              style={{
                flex: 1,
                background: mode === m ? '#2563eb' : '#e2e8f0',
                color: mode === m ? '#fff' : '#1e293b',
              }}
            >
              {m}
            </button>
          ))}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
            输入
            <textarea
              className="tool-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={10}
              placeholder={mode === 'xml2json' ? '<root><a>1</a></root>' : '{"root":{"a":"1"}}'}
              style={{ width: '100%', fontSize: 14, padding: '10px 12px', fontFamily: 'monospace', resize: 'vertical' }}
            />
          </label>
        </div>

        <button type="button" className="tool-btn" onClick={run} disabled={loading} style={{ marginTop: 4 }}>
          {loading ? '转换中...' : '转换'}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontWeight: 500 }}>结果</span>
              <button type="button" className="tool-btn" onClick={copy} style={{ padding: '4px 10px', fontSize: 13 }}>
                复制
              </button>
            </div>
            <textarea
              className="tool-input"
              value={result.result}
              readOnly
              rows={10}
              style={{
                width: '100%',
                fontSize: 14,
                padding: '10px 12px',
                fontFamily: 'monospace',
                background: '#f8fafc',
                resize: 'vertical',
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Component;
