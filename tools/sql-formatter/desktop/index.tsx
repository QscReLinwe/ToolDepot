import type { ToolViewProps } from '@tooldepot/types';
import type React from 'react';
import { useState } from 'react';
import type { SqlFormatterInput, SqlFormatterOutput, SqlLanguage } from '../core/index.js';

const LANGUAGES: SqlLanguage[] = ['sql', 'mysql', 'postgresql', 'sqlite', 'mssql', 'MariaDB', 'db2', 'plsql'];

export const Component: React.FC<ToolViewProps<SqlFormatterInput, SqlFormatterOutput>> = ({
  tool,
  initialInput,
  onResult,
}) => {
  const [sql, setSql] = useState<string>(
    initialInput?.sql || 'select id,name,email from users where active=1 order by name',
  );
  const [language, setLanguage] = useState<SqlLanguage>(initialInput?.language || 'sql');
  const [keywordCase, setKeywordCase] = useState<'upper' | 'lower'>(initialInput?.keywordCase || 'upper');
  const [result, setResult] = useState<SqlFormatterOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!sql.trim()) {
      setError('请输入 SQL 查询');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const out = await tool.run({ sql, language, keywordCase });
      if (out.ok && out.data) {
        setResult(out.data);
        if (out.data.error) setError(out.data.error);
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
    if (result?.formatted) navigator.clipboard?.writeText(result.formatted);
  };

  return (
    <div className="tool-card" style={{ padding: 20, maxWidth: 720 }}>
      <h3 style={{ marginBottom: 16 }}>SQL 格式化工具</h3>

      <div style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label htmlFor="sf-language" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              方言
            </label>
            <select
              id="sf-language"
              className="tool-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value as SqlLanguage)}
              style={{ width: '100%', fontSize: 15, padding: '10px 12px' }}
            >
              {LANGUAGES.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="sf-keyword-case" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              关键字大小写
            </label>
            <select
              id="sf-keyword-case"
              className="tool-select"
              value={keywordCase}
              onChange={(e) => setKeywordCase(e.target.value as 'upper' | 'lower')}
              style={{ width: '100%', fontSize: 15, padding: '10px 12px' }}
            >
              <option value="upper">大写</option>
              <option value="lower">小写</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="sf-sql" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
            SQL 输入
          </label>
          <textarea
            id="sf-sql"
            className="tool-input"
            value={sql}
            onChange={(e) => setSql(e.target.value)}
            rows={5}
            style={{ width: '100%', fontSize: 14, padding: '10px 12px', fontFamily: 'monospace', resize: 'vertical' }}
          />
        </div>

        <button
          type="button"
          className="tool-btn"
          onClick={run}
          disabled={loading || !sql.trim()}
          style={{ marginTop: 4 }}
        >
          {loading ? '格式化中...' : '格式化'}
        </button>

        {error && (
          <div
            className="tool-error"
            style={{ color: '#dc2626', marginTop: 12, padding: 12, background: '#fef2f2', borderRadius: 6 }}
          >
            {error}
          </div>
        )}

        {result?.formatted && (
          <div className="tool-result" style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontWeight: 500 }}>格式化结果</span>
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
              {result.formatted}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default Component;
