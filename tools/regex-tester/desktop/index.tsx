import type { ToolViewProps } from '@tooldepot/types';
import type React from 'react';
import { useState } from 'react';
import type { RegexTesterInput, RegexTesterOutput } from '../core/index.js';

const COMMON_PATTERNS: Array<{ label: string; pattern: string; flags: string }> = [
  { label: '邮箱', pattern: '[\\w.+-]+@[\\w-]+\\.[\\w.-]+', flags: 'g' },
  { label: '网址', pattern: 'https?:\\/\\/[\\w.-]+(?:\\/[\\w./?%&=-]*)?', flags: 'g' },
  { label: '电话', pattern: '\\+?\\d[\\d\\s().-]{7,}\\d', flags: 'g' },
  { label: 'IPv4', pattern: '\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b', flags: 'g' },
  { label: '十六进制颜色', pattern: '#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\\b', flags: 'g' },
];

export const Component: React.FC<ToolViewProps<RegexTesterInput, RegexTesterOutput>> = ({
  tool,
  initialInput,
  onResult,
}) => {
  const [pattern, setPattern] = useState<string>(initialInput?.pattern ?? '');
  const [flags, setFlags] = useState<string>(initialInput?.flags ?? 'g');
  const [text, setText] = useState<string>(initialInput?.text ?? '');
  const [replace, setReplace] = useState<string>(initialInput?.replace ?? '');
  const [result, setResult] = useState<RegexTesterOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setError(null);
    const out = await tool.run({ pattern, flags, text, replace: replace || undefined });
    if (out.ok && out.data) {
      setResult(out.data);
      if (out.data.error) setError(out.data.error);
    } else {
      setError(out.error ?? '未知错误');
      setResult(null);
    }
    onResult?.(out);
  };

  return (
    <div className="tool-card" style={{ padding: 20, maxWidth: 720 }}>
      <h3 style={{ marginBottom: 16 }}>正则表达式测试</h3>

      <div style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            className="tool-select"
            style={{ width: 'auto' }}
            value=""
            onChange={(e) => {
              const p = COMMON_PATTERNS.find((c) => c.label === e.target.value);
              if (p) {
                setPattern(p.pattern);
                setFlags(p.flags);
              }
            }}
          >
            <option value="">常用模式</option>
            {COMMON_PATTERNS.map((c) => (
              <option key={c.label} value={c.label}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 10 }}>
          <div>
            <label htmlFor="rt-pattern" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              表达式
            </label>
            <input
              id="rt-pattern"
              className="tool-input"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="\\d+"
              style={{ width: '100%', fontFamily: 'monospace', padding: '10px 12px' }}
            />
          </div>
          <div>
            <label htmlFor="rt-flags" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              标志
            </label>
            <input
              id="rt-flags"
              className="tool-input"
              value={flags}
              onChange={(e) => setFlags(e.target.value)}
              placeholder="gi"
              style={{ width: '100%', fontFamily: 'monospace', padding: '10px 12px' }}
            />
          </div>
        </div>

        <div>
          <label htmlFor="rt-text" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
            测试文本
          </label>
          <textarea
            id="rt-text"
            className="tool-textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            style={{ width: '100%', fontFamily: 'monospace' }}
          />
        </div>

        <div>
          <label htmlFor="rt-replace" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
            替换（可选）
          </label>
          <input
            id="rt-replace"
            className="tool-input"
            value={replace}
            onChange={(e) => setReplace(e.target.value)}
            placeholder="$1"
            style={{ width: '100%', fontFamily: 'monospace', padding: '10px 12px' }}
          />
        </div>

        <button type="button" className="tool-btn" onClick={() => void run()} style={{ marginTop: 4 }}>
          测试
        </button>

        {error && (
          <div
            className="tool-error"
            style={{ color: '#dc2626', marginTop: 12, padding: 12, background: '#fef2f2', borderRadius: 6 }}
          >
            {error}
          </div>
        )}

        {result && !result.error && (
          <div className="tool-result" style={{ marginTop: 16, padding: 12, background: '#f8fafc', borderRadius: 6 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>{result.matchCount} 处匹配</div>
            <div style={{ display: 'grid', gap: 6, maxHeight: 200, overflow: 'auto' }}>
              {result.matches.map((m) => (
                <div key={m.index} style={{ fontSize: 13, fontFamily: 'monospace', display: 'flex', gap: 8 }}>
                  <span style={{ color: '#64748b' }}>@{m.index}</span>
                  <span style={{ background: '#fde68a', padding: '0 4px', borderRadius: 3 }}>
                    {m.match || '（空）'}
                  </span>
                  {m.groups && m.groups.length > 0 && (
                    <span style={{ color: '#64748b' }}>分组：[{m.groups.join(', ')}]</span>
                  )}
                </div>
              ))}
            </div>
            {result.replaced !== undefined && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>替换结果</div>
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 13, fontFamily: 'monospace' }}>
                  {result.replaced}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Component;
