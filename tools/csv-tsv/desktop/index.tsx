import type { ToolViewProps } from '@tooldepot/types';
import type React from 'react';
import { useState } from 'react';
import type { CsvTsvInput, CsvTsvOutput } from '../core/index.js';

const MODES: CsvTsvInput['mode'][] = ['csv2tsv', 'tsv2csv', 'csv2json', 'json2csv'];

export const Component: React.FC<ToolViewProps<CsvTsvInput, CsvTsvOutput>> = ({ tool, initialInput, onResult }) => {
  const [mode, setMode] = useState<CsvTsvInput['mode']>(initialInput?.mode || 'csv2tsv');
  const [text, setText] = useState<string>(initialInput?.text || '');
  const [hasHeader, setHasHeader] = useState<boolean>(initialInput?.hasHeader ?? true);
  const [result, setResult] = useState<CsvTsvOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const out = await tool.run({ mode, text, hasHeader });
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

  return (
    <div className="tool-card" style={{ padding: 20, maxWidth: 720 }}>
      <h3 style={{ marginBottom: 16 }}>CSV / TSV 工具</h3>

      <div style={{ display: 'grid', gap: 12 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
            模式
            <select
              className="tool-select"
              value={mode}
              onChange={(e) => setMode(e.target.value as CsvTsvInput['mode'])}
              style={{ width: '100%', fontSize: 15, padding: '10px 12px' }}
            >
              {MODES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
            输入
            <textarea
              className="tool-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={8}
              placeholder="在此粘贴 CSV、TSV 或 JSON"
              style={{ width: '100%', fontSize: 14, padding: '10px 12px', fontFamily: 'monospace', resize: 'vertical' }}
            />
          </label>
        </div>

        {mode !== 'json2csv' && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}>
            <input type="checkbox" checked={hasHeader} onChange={(e) => setHasHeader(e.target.checked)} />
            首行为表头
          </label>
        )}

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
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 13,
                color: '#64748b',
                marginBottom: 6,
              }}
            >
              <span>结果</span>
              <span>
                {result.rows !== undefined ? `${result.rows} 行` : ''}
                {result.rows !== undefined && result.cols !== undefined ? ' · ' : ''}
                {result.cols !== undefined ? `${result.cols} 列` : ''}
              </span>
            </div>
            <textarea
              className="tool-input"
              value={result.result}
              readOnly
              rows={8}
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
