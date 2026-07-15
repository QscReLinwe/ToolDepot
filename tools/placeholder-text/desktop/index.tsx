import type { ToolViewProps } from '@tooldepot/types';
import type React from 'react';
import { useState } from 'react';
import type { PlaceholderTextInput, PlaceholderTextOutput } from '../core/index.js';

const UNITS: PlaceholderTextInput['unit'][] = ['words', 'sentences', 'paragraphs'];
const LANGS: PlaceholderTextInput['language'][] = ['en', 'zh'];

export const Component: React.FC<ToolViewProps<PlaceholderTextInput, PlaceholderTextOutput>> = ({
  tool,
  initialInput,
  onResult,
}) => {
  const [count, setCount] = useState<number>(initialInput?.count ?? 3);
  const [unit, setUnit] = useState<PlaceholderTextInput['unit']>(initialInput?.unit || 'paragraphs');
  const [startWithLorem, setStartWithLorem] = useState<boolean>(initialInput?.startWithLorem ?? true);
  const [language, setLanguage] = useState<PlaceholderTextInput['language']>(initialInput?.language || 'en');
  const [result, setResult] = useState<PlaceholderTextOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const out = await tool.run({ count, unit, startWithLorem, language });
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
    if (result?.text) await navigator.clipboard.writeText(result.text);
  };

  return (
    <div className="tool-card" style={{ padding: 20, maxWidth: 720 }}>
      <h3 style={{ marginBottom: 16 }}>占位文本</h3>

      <div style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label htmlFor="pt-count" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              数量
            </label>
            <input
              className="tool-input"
              type="number"
              min={1}
              id="pt-count"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              style={{ width: '100%', fontSize: 15, padding: '10px 12px' }}
            />
          </div>
          <div>
            <label htmlFor="pt-unit" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              单位
            </label>
            <select
              className="tool-select"
              id="pt-unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value as PlaceholderTextInput['unit'])}
              style={{ width: '100%', fontSize: 15, padding: '10px 12px' }}
            >
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label htmlFor="pt-language" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              语言
            </label>
            <select
              className="tool-select"
              id="pt-language"
              value={language}
              onChange={(e) => setLanguage(e.target.value as PlaceholderTextInput['language'])}
              style={{ width: '100%', fontSize: 15, padding: '10px 12px' }}
            >
              {LANGS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
              <input
                type="checkbox"
                checked={startWithLorem}
                onChange={(e) => setStartWithLorem(e.target.checked)}
                disabled={language === 'zh'}
              />
              以 Lorem ipsum 开头{' '}
            </label>
          </div>
        </div>

        <button type="button" className="tool-btn" onClick={run} disabled={loading} style={{ marginTop: 4 }}>
          {loading ? '生成中…' : '生成'}
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
              <span style={{ fontSize: 13, color: '#64748b' }}>{result.words} 词</span>
              <button type="button" className="tool-btn" onClick={copy} style={{ padding: '4px 10px', fontSize: 13 }}>
                复制
              </button>
            </div>
            <textarea
              className="tool-input"
              value={result.text}
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
