import type { ToolViewProps } from '@tooldepot/types';
import type React from 'react';
import { useState } from 'react';
import type { PasswordStrengthInput, PasswordStrengthOutput } from '../core/index.js';

const SCORE_LABEL = ['非常弱', '弱', '一般', '强', '非常强'];
const SCORE_COLOR = ['#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#15803d'];

export const Component: React.FC<ToolViewProps<PasswordStrengthInput, PasswordStrengthOutput>> = ({
  tool,
  initialInput,
  onResult,
}) => {
  const [password, setPassword] = useState<string>(initialInput?.password ?? '');
  const [result, setResult] = useState<PasswordStrengthOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setError(null);
    const out = await tool.run({ password });
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
      <h3 style={{ marginBottom: 16 }}>密码强度</h3>

      <div style={{ display: 'grid', gap: 12, maxWidth: 500 }}>
        <div>
          <label htmlFor="ps-password" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
            密码
          </label>
          <input
            id="ps-password"
            className="tool-input"
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入密码"
            style={{ width: '100%', fontSize: 15, padding: '10px 12px' }}
          />
        </div>

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
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div
                style={{
                  flex: 1,
                  height: 10,
                  borderRadius: 5,
                  background: '#e2e8f0',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${((result.score + 1) / 5) * 100}%`,
                    height: '100%',
                    background: SCORE_COLOR[result.score],
                  }}
                />
              </div>
              <span style={{ fontWeight: 600, color: SCORE_COLOR[result.score], minWidth: 80, textAlign: 'right' }}>
                {SCORE_LABEL[result.score]}
              </span>
            </div>
            <div style={{ fontSize: 13, color: '#475569' }}>
              熵：<strong>{result.entropy} 位</strong>
              {result.crackTimeEstimate ? ` · 破解时间约${result.crackTimeEstimate}` : ''}
            </div>
            {result.suggestions.length > 0 && (
              <ul style={{ margin: '8px 0 0', paddingLeft: 20, fontSize: 13, color: '#64748b' }}>
                {result.suggestions.map((s) => (
                  <li key={s}>{s}</li>
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
