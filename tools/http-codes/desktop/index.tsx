import type { ToolViewProps } from '@tooldepot/types';
import type React from 'react';
import { useState } from 'react';
import type { HttpCode, HttpCodesInput, HttpCodesOutput } from '../core/index.js';

const CATEGORY_COLORS: Record<string, string> = {
  Informational: '#0ea5e9',
  Success: '#22c55e',
  Redirection: '#f59e0b',
  'Client Error': '#ef4444',
  'Server Error': '#a855f7',
};

export const Component: React.FC<ToolViewProps<HttpCodesInput, HttpCodesOutput>> = ({
  tool,
  initialInput,
  onResult,
}) => {
  const [query, setQuery] = useState<string>(initialInput?.query || '');
  const [results, setResults] = useState<HttpCode[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const out = await tool.run({ query: query.trim() || undefined });
      if (out.ok && out.data) {
        setResults(out.data.results);
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

  return (
    <div className="tool-card" style={{ padding: 20, maxWidth: 760 }}>
      <h3 style={{ marginBottom: 16 }}>HTTP 状态码</h3>

      <div style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'end' }}>
          <div>
            <label htmlFor="http-codes-query" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              搜索（代码、名称或描述）
            </label>
            <input
              id="http-codes-query"
              className="tool-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="例如 404、速率限制、重定向"
              style={{ width: '100%', fontSize: 15, padding: '10px 12px' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') run();
              }}
            />
          </div>
          <button type="button" className="tool-btn" onClick={run} disabled={loading} style={{ whiteSpace: 'nowrap' }}>
            {loading ? '搜索中...' : '搜索'}
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

        <div className="tool-result" style={{ marginTop: 8 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '8px 10px' }}>代码</th>
                <th style={{ padding: '8px 10px' }}>名称</th>
                <th style={{ padding: '8px 10px' }}>类别</th>
                <th style={{ padding: '8px 10px' }}>描述</th>
              </tr>
            </thead>
            <tbody>
              {results.map((c) => (
                <tr key={c.code} style={{ borderBottom: '1px solid #f1f5f9', verticalAlign: 'top' }}>
                  <td style={{ padding: '8px 10px', fontFamily: 'monospace', fontWeight: 600 }}>{c.code}</td>
                  <td style={{ padding: '8px 10px', fontWeight: 500 }}>{c.name}</td>
                  <td style={{ padding: '8px 10px' }}>
                    <span
                      style={{
                        color: '#fff',
                        background: CATEGORY_COLORS[c.category] || '#64748b',
                        padding: '2px 8px',
                        borderRadius: 12,
                        fontSize: 12,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {c.category}
                    </span>
                  </td>
                  <td style={{ padding: '8px 10px', color: '#475569' }}>{c.description}</td>
                </tr>
              ))}
              {results.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: 16, textAlign: 'center', color: '#64748b' }}>
                    没有匹配的状态码
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Component;
