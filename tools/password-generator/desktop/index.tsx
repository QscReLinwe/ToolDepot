import type { ToolViewProps } from '@tooldepot/types';
import type React from 'react';
import { useState } from 'react';
import type { PasswordGeneratorInput, PasswordGeneratorOutput } from '../core/index.js';

export const Component: React.FC<ToolViewProps<PasswordGeneratorInput, PasswordGeneratorOutput>> = ({
  tool,
  initialInput,
  onResult,
}) => {
  const [length, setLength] = useState<number>(initialInput?.length ?? 16);
  const [count, setCount] = useState<number>(initialInput?.count ?? 1);
  const [uppercase, setUppercase] = useState<boolean>(initialInput?.uppercase ?? true);
  const [lowercase, setLowercase] = useState<boolean>(initialInput?.lowercase ?? true);
  const [digits, setDigits] = useState<boolean>(initialInput?.digits ?? true);
  const [symbols, setSymbols] = useState<boolean>(initialInput?.symbols ?? true);
  const [excludeSimilar, setExcludeSimilar] = useState<boolean>(initialInput?.excludeSimilar ?? false);
  const [result, setResult] = useState<PasswordGeneratorOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const out = await tool.run({
        length,
        count,
        uppercase,
        lowercase,
        digits,
        symbols,
        excludeSimilar,
      });
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
    if (result?.passwords) {
      await navigator.clipboard.writeText(result.passwords.join('\n'));
    }
  };

  const toggle = (label: string, checked: boolean, set: (v: boolean) => void) => (
    <label key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
      <input type="checkbox" checked={checked} onChange={(e) => set(e.target.checked)} />
      {label}
    </label>
  );

  return (
    <div className="tool-card" style={{ padding: 20, maxWidth: 640 }}>
      <h3 style={{ marginBottom: 16 }}>密码生成器</h3>

      <div style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label htmlFor="pg-length" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              长度：{length}
            </label>
            <input
              id="pg-length"
              className="tool-input"
              type="range"
              min={4}
              max={64}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label htmlFor="pg-count" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              数量
            </label>
            <input
              id="pg-count"
              className="tool-input"
              type="number"
              min={1}
              max={1000}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              style={{ width: '100%', fontSize: 15, padding: '10px 12px' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {toggle('大写字母（A-Z）', uppercase, setUppercase)}
          {toggle('小写字母（a-z）', lowercase, setLowercase)}
          {toggle('数字（0-9）', digits, setDigits)}
          {toggle('符号（@#）', symbols, setSymbols)}
        </div>

        {toggle('排除相似字符（i,l,1,L,o,O,0,I,|）', excludeSimilar, setExcludeSimilar)}

        <button type="button" className="tool-btn" onClick={run} disabled={loading} style={{ marginTop: 4 }}>
          {loading ? '生成中...' : '生成'}
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
              <span style={{ fontSize: 13, color: '#64748b' }}> 熵：{result.entropy} 位</span>
              <button type="button" className="tool-btn" onClick={copy} style={{ padding: '4px 10px', fontSize: 13 }}>
                全部复制
              </button>
            </div>
            <div style={{ display: 'grid', gap: 6 }}>
              {result.passwords.map((pw) => (
                <div
                  key={pw}
                  style={{
                    fontFamily: 'monospace',
                    fontSize: 15,
                    padding: '8px 12px',
                    background: '#f8fafc',
                    borderRadius: 6,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span>{pw}</span>
                  <button
                    type="button"
                    className="tool-btn"
                    onClick={() => navigator.clipboard.writeText(pw)}
                    style={{ padding: '2px 8px', fontSize: 12 }}
                  >
                    复制
                  </button>
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
