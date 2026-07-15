import type { ToolViewProps } from '@tooldepot/types';
import type React from 'react';
import { useState } from 'react';
import type { ReadingTimeInput, ReadingTimeOutput } from '../core/index.js';

export const Component: React.FC<ToolViewProps<ReadingTimeInput, ReadingTimeOutput>> = ({
  tool,
  initialInput,
  onResult,
}) => {
  const [text, setText] = useState<string>(initialInput?.text ?? '');
  const [wpm, setWpm] = useState<string>(String(initialInput?.wpm ?? 200));
  const [cjk, setCjk] = useState<boolean>(initialInput?.cjk ?? false);
  const [result, setResult] = useState<ReadingTimeOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setError(null);
    const out = await tool.run({
      text,
      wpm: wpm ? Number(wpm) : undefined,
      cjk,
    });
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
      <h3 style={{ marginBottom: 16 }}>阅读时长</h3>

      <div style={{ display: 'grid', gap: 12, maxWidth: 500 }}>
        <div>
          <label htmlFor="rt-text" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
            文本
          </label>
          <textarea
            id="rt-text"
            className="tool-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            placeholder="粘贴要分析的文本"
            style={{ width: '100%', fontSize: 15, padding: '10px 12px', resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'end' }}>
          <div>
            <label htmlFor="rt-wpm" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              每分钟字数
            </label>
            <input
              id="rt-wpm"
              className="tool-input"
              type="number"
              min={1}
              value={wpm}
              onChange={(e) => setWpm(e.target.value)}
              style={{ width: '100%', fontSize: 15, padding: '10px 12px' }}
            />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, paddingBottom: 10 }}>
            <input type="checkbox" checked={cjk} onChange={(e) => setCjk(e.target.checked)} />
            中日韩{' '}
          </label>
        </div>

        <button type="button" className="tool-btn" onClick={run} style={{ marginTop: 4 }}>
          估算
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
            <div style={{ fontSize: 18, fontWeight: 600 }}>
              {result.minutes} 分 {result.seconds} 秒{' '}
            </div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
              {result.words} {cjk ? '字符' : '词'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Component;
