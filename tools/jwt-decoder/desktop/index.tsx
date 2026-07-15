import type { ToolViewProps } from '@tooldepot/types';
import type React from 'react';
import { useState } from 'react';
import type { JwtDecoderInput, JwtDecoderOutput } from '../core/index.js';

const SAMPLE =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

export const Component: React.FC<ToolViewProps<JwtDecoderInput, JwtDecoderOutput>> = ({
  tool,
  initialInput,
  onResult,
}) => {
  const [token, setToken] = useState<string>(initialInput?.token ?? SAMPLE);
  const [result, setResult] = useState<JwtDecoderOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (value: string) => {
    setError(null);
    const out = await tool.run({ token: value });
    if (out.ok && out.data) {
      setResult(out.data);
    } else {
      setError(out.error ?? '未知错误');
      setResult(null);
    }
    onResult?.(out);
  };

  return (
    <div className="tool-card" style={{ padding: 20, maxWidth: 720 }}>
      <h3 style={{ marginBottom: 16 }}>JWT 解码器</h3>

      <div style={{ display: 'grid', gap: 12 }}>
        <div>
          <label htmlFor="jwt-decoder-token" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
            JWT 令牌
          </label>
          <textarea
            id="jwt-decoder-token"
            className="tool-textarea"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            rows={4}
            style={{ width: '100%', fontFamily: 'monospace' }}
          />
        </div>

        <button type="button" className="tool-btn" onClick={() => void run(token)} style={{ marginTop: 4 }}>
          解码
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
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 500 }}>签名：</span>
              <span style={{ fontSize: 13 }}>{result.signaturePresent ? '存在' : '缺失'}</span>
              {result.expired !== undefined && (
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    padding: '2px 10px',
                    borderRadius: 999,
                    color: '#fff',
                    background: result.expired ? '#dc2626' : '#16a34a',
                  }}
                >
                  {result.expired ? '已过期' : '有效'}
                </span>
              )}
              {result.expiresAt && <span style={{ fontSize: 13, color: '#64748b' }}>过期时间 {result.expiresAt}</span>}
              {result.issuedAt && <span style={{ fontSize: 13, color: '#64748b' }}>签发时间 {result.issuedAt}</span>}
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              <div>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>头部</div>
                <pre
                  style={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontSize: 13,
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 6,
                    padding: 10,
                    margin: 0,
                  }}
                >
                  {JSON.stringify(result.header, null, 2)}
                </pre>
              </div>
              <div>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>载荷</div>
                <pre
                  style={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontSize: 13,
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 6,
                    padding: 10,
                    margin: 0,
                  }}
                >
                  {JSON.stringify(result.payload, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Component;
