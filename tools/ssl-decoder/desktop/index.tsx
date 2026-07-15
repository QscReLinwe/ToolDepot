import type { ToolViewProps } from '@tooldepot/types';
import type React from 'react';
import { useState } from 'react';
import type { SslDecoderInput, SslDecoderOutput } from '../core/index.js';

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 2 }}>{label}</div>
      <div style={{ fontFamily: 'monospace', fontSize: 13, wordBreak: 'break-all' }}>{value}</div>
    </div>
  );
}

function NameBlock({ title, data }: { title: string; data?: Record<string, string> }) {
  if (!data) return null;
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{title}</div>
      {Object.entries(data).map(([k, v]) => (
        <div key={k} style={{ display: 'flex', gap: 8, fontSize: 13 }}>
          <span style={{ color: '#64748b', minWidth: 90 }}>{k}</span>
          <span style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>{v}</span>
        </div>
      ))}
    </div>
  );
}

export const Component: React.FC<ToolViewProps<SslDecoderInput, SslDecoderOutput>> = ({
  tool,
  initialInput,
  onResult,
}) => {
  const [pem, setPem] = useState<string>(initialInput?.pem || '');
  const [result, setResult] = useState<SslDecoderOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!pem.trim()) {
      setError('请粘贴 PEM 证书');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const out = await tool.run({ pem: pem.trim() });
      if (out.ok && out.data) {
        setResult(out.data);
        if (!out.data.valid) setError(out.data.error || '证书无效');
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

  const days = result?.daysRemaining;
  const expired = days !== undefined && days < 0;
  const expiringSoon = days !== undefined && days >= 0 && days <= 30;

  return (
    <div className="tool-card" style={{ padding: 20, maxWidth: 680 }}>
      <h3 style={{ marginBottom: 16 }}>SSL 证书解码器</h3>

      <div style={{ display: 'grid', gap: 12 }}>
        <div>
          <label htmlFor="ssl-pem" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
            PEM 证书
          </label>
          <textarea
            id="ssl-pem"
            className="tool-input"
            value={pem}
            onChange={(e) => setPem(e.target.value)}
            rows={8}
            placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
            style={{ width: '100%', fontSize: 13, padding: '10px 12px', fontFamily: 'monospace', resize: 'vertical' }}
          />
        </div>

        <button
          type="button"
          className="tool-btn"
          onClick={run}
          disabled={loading || !pem.trim()}
          style={{ marginTop: 4 }}
        >
          {loading ? '解码中..' : '解码'}
        </button>

        {error && (
          <div
            className="tool-error"
            style={{ color: '#dc2626', marginTop: 12, padding: 12, background: '#fef2f2', borderRadius: 6 }}
          >
            {error}
          </div>
        )}

        {result?.valid && (
          <div className="tool-result" style={{ marginTop: 12, padding: 16, background: '#f8fafc', borderRadius: 6 }}>
            {days !== undefined && (
              <div
                style={{
                  display: 'inline-block',
                  padding: '4px 12px',
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#fff',
                  background: expired ? '#dc2626' : expiringSoon ? '#f59e0b' : '#22c55e',
                  marginBottom: 12,
                }}
              >
                {expired ? `已过期${Math.abs(days)} 天` : `剩余 ${days} 天`}
              </div>
            )}
            <NameBlock title="主题" data={result.subject} />
            <NameBlock title="颁发者" data={result.issuer} />
            <Field label="生效时间" value={result.validFrom || '无'} />
            <Field label="到期时间" value={result.validTo || '无'} />
            <Field label="序列号" value={result.serialNumber || '无'} />
            <Field label="SHA-1 指纹" value={result.fingerprintSha1 || '无'} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Component;
