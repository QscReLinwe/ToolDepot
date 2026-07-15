import type { ToolViewProps } from '@tooldepot/types';
import type React from 'react';
import { useState } from 'react';
import type { TextStatsInput, TextStatsOutput } from '../core/index.js';

const FIELDS: Array<{ key: keyof TextStatsOutput; label: string }> = [
  { key: 'characters', label: '字符数' },
  { key: 'charactersNoSpaces', label: '字符数（不含空格）' },
  { key: 'words', label: '单词数' },
  { key: 'lines', label: '行数' },
  { key: 'paragraphs', label: '段落数' },
  { key: 'readingMinutes', label: '阅读分钟数' },
];

export const Component: React.FC<ToolViewProps<TextStatsInput, TextStatsOutput>> = ({
  tool,
  initialInput,
  onResult,
}) => {
  const [text, setText] = useState<string>(initialInput?.text ?? '');
  const [cjk, setCjk] = useState<boolean>(initialInput?.cjk ?? false);
  const [result, setResult] = useState<TextStatsOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setError(null);
    const out = await tool.run({ text, cjk });
    if (out.ok && out.data) {
      setResult(out.data);
    } else {
      setError(out.error ?? '未知错误');
      setResult(null);
    }
    onResult?.(out);
  };

  return (
    <div className="tool-card" style={{ padding: 20, maxWidth: 600 }}>
      <h3 style={{ marginBottom: 16 }}>文本统计</h3>

      <div style={{ display: 'grid', gap: 12, maxWidth: 500 }}>
        <div>
          <label htmlFor="ts-text" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
            文本
          </label>
          <textarea
            id="ts-text"
            className="tool-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            placeholder="粘贴要分析的文本"
            style={{ width: '100%', fontSize: 15, padding: '10px 12px', resize: 'vertical' }}
          />
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input type="checkbox" checked={cjk} onChange={(e) => setCjk(e.target.checked)} />将 CJK 字符按词计数
        </label>

        <button type="button" className="tool-btn" onClick={run} style={{ marginTop: 4 }}>
          分析
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
          <div className="tool-result" style={{ marginTop: 16, padding: 12, background: '#f8fafc', borderRadius: 6 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {FIELDS.map(({ key, label }) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span style={{ color: '#64748b' }}>{label}</span>
                  <strong>{result[key]}</strong>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Component;
