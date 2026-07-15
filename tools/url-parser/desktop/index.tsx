import type { ToolViewProps } from '@tooldepot/types';
import type React from 'react';
import { useState } from 'react';
import type { UrlMode, UrlParserInput, UrlParserOutput } from '../core/index.js';

export const Component: React.FC<ToolViewProps<UrlParserInput, UrlParserOutput>> = ({
  tool,
  initialInput,
  onResult,
}) => {
  const [mode, setMode] = useState<UrlMode>(initialInput?.mode || 'parse');
  const [url, setUrl] = useState<string>(
    initialInput?.url || 'https://user:pass@example.com:8080/path/to?a=1&b=2#frag',
  );
  const [base, setBase] = useState<string>(initialInput?.base || '');
  const [result, setResult] = useState<UrlParserOutput['result'] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (mode !== 'build' && !url.trim()) {
      setError('请输入 URL');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const out = await tool.run({ mode, url, base: base || undefined });
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
    if (result) navigator.clipboard?.writeText(result.href);
  };

  const fieldRows: [string, string][] = result
    ? [
        ['href', result.href],
        ['origin', result.origin],
        ['protocol', result.protocol],
        ['username', result.username],
        ['password', result.password],
        ['host', result.host],
        ['hostname', result.hostname],
        ['port', result.port],
        ['pathname', result.pathname],
        ['search', result.search],
        ['hash', result.hash],
      ]
    : [];

  return (
    <div className="tool-card" style={{ padding: 20, maxWidth: 720 }}>
      <h3 style={{ marginBottom: 16 }}>URL 解析器</h3>

      <div style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['parse', 'query', 'build'] as UrlMode[]).map((m) => (
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
              {m}
            </button>
          ))}
        </div>

        {mode !== 'build' && (
          <>
            <div>
              <label htmlFor="url-parser-url" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                URL
              </label>
              <input
                id="url-parser-url"
                className="tool-input"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                style={{ width: '100%', fontSize: 14, padding: '10px 12px', fontFamily: 'monospace' }}
              />
            </div>
            <div>
              <label htmlFor="url-parser-base" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                基准（可选，用于相对 URL）
              </label>
              <input
                id="url-parser-base"
                className="tool-input"
                value={base}
                onChange={(e) => setBase(e.target.value)}
                placeholder="https://example.com"
                style={{ width: '100%', fontSize: 14, padding: '10px 12px', fontFamily: 'monospace' }}
              />
            </div>
          </>
        )}

        <button type="button" className="tool-btn" onClick={run} disabled={loading} style={{ marginTop: 4 }}>
          {loading ? '解析中..' : '运行'}
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
              <span style={{ fontWeight: 500 }}>组成部分</span>
              <button type="button" className="tool-btn" style={{ padding: '4px 10px', fontSize: 13 }} onClick={copy}>
                复制 href
              </button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <tbody>
                {fieldRows.map(([k, v]) => (
                  <tr key={k} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '6px 8px', fontWeight: 600, color: '#475569', width: 120 }}>{k}</td>
                    <td style={{ padding: '6px 8px', fontFamily: 'monospace', wordBreak: 'break-all' }}>{v || '无'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: 12, fontWeight: 500 }}>查询参数</div>
            <pre
              style={{
                margin: '6px 0 0',
                padding: 12,
                background: '#f8fafc',
                borderRadius: 6,
                fontFamily: 'monospace',
                fontSize: 13,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {JSON.stringify(result.query, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default Component;
