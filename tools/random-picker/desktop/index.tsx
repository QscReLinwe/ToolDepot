import type { ToolViewProps } from '@tooldepot/types';
import type React from 'react';
import { useState } from 'react';
import type { PickerMode, RandomPickerInput, RandomPickerOutput } from '../core/index.js';

const MODES: PickerMode[] = ['pick-one', 'pick-n', 'shuffle', 'groups'];

export const Component: React.FC<ToolViewProps<RandomPickerInput, RandomPickerOutput>> = ({
  tool,
  initialInput,
  onResult,
}) => {
  const [text, setText] = useState<string>(initialInput?.text || 'Alice\nBob\nCarol\nDave\nEve');
  const [mode, setMode] = useState<PickerMode>(initialInput?.mode || 'pick-one');
  const [count, setCount] = useState<number>(initialInput?.count ?? 2);
  const [groupSize, setGroupSize] = useState<number>(initialInput?.groupSize ?? 2);
  const [result, setResult] = useState<RandomPickerOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setError(null);
    const out = await tool.run({ text, mode, count, groupSize });
    if (out.ok && out.data) {
      setResult(out.data);
    } else {
      setError(out.error || '未知错误');
      setResult(null);
    }
    onResult?.(out);
  };

  return (
    <div className="tool-card" style={{ padding: 20, maxWidth: 560 }}>
      <h3 style={{ marginBottom: 16 }}>随机抽取</h3>

      <div style={{ display: 'grid', gap: 14, maxWidth: 480 }}>
        <div>
          <label htmlFor="rp-text" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
            项目（每行一个或用逗号分隔）
          </label>
          <textarea
            id="rp-text"
            className="tool-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            placeholder={'Alice\nBob\nCarol'}
            style={{ width: '100%', fontSize: 15, padding: '10px 12px', resize: 'vertical', fontFamily: 'inherit' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label htmlFor="rp-mode" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              模式
            </label>
            <select
              id="rp-mode"
              className="tool-select"
              value={mode}
              onChange={(e) => setMode(e.target.value as PickerMode)}
              style={{ width: '100%', fontSize: 15, padding: '10px 12px' }}
            >
              {MODES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          {mode === 'pick-n' ? (
            <div>
              <label htmlFor="rp-count" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                数量
              </label>
              <input
                id="rp-count"
                className="tool-input"
                type="number"
                min={1}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                style={{ width: '100%', fontSize: 15, padding: '10px 12px' }}
              />
            </div>
          ) : mode === 'groups' ? (
            <div>
              <label htmlFor="rp-group-size" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
                每组人数
              </label>
              <input
                id="rp-group-size"
                className="tool-input"
                type="number"
                min={1}
                value={groupSize}
                onChange={(e) => setGroupSize(Number(e.target.value))}
                style={{ width: '100%', fontSize: 15, padding: '10px 12px' }}
              />
            </div>
          ) : (
            <div />
          )}
        </div>

        <button type="button" className="tool-btn" onClick={run} style={{ marginTop: 4 }}>
          运行
        </button>

        {error && (
          <div
            className="tool-error"
            style={{ color: '#dc2626', marginTop: 8, padding: 12, background: '#fef2f2', borderRadius: 6 }}
          >
            {error}
          </div>
        )}

        {result && (
          <div className="tool-result" style={{ marginTop: 12 }}>
            {result.groups ? (
              <div style={{ display: 'grid', gap: 10 }}>
                {result.groups.map((g, i) => (
                  <div key={g.join('|')} style={{ padding: 12, background: '#f8fafc', borderRadius: 6 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>
                      第 {i + 1} 组{' '}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {g.map((item) => (
                        <span
                          key={item}
                          style={{
                            background: '#e0e7ff',
                            color: '#3730a3',
                            padding: '4px 10px',
                            borderRadius: 999,
                            fontSize: 14,
                          }}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {result.result.map((item) => (
                  <li key={item} style={{ fontSize: 15, padding: '4px 0' }}>
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Component;
