import type { ToolViewProps } from '@tooldepot/types';
import type React from 'react';
import { useState } from 'react';
import type { Base64ImageInput, Base64ImageOutput } from '../core/index.js';

export const Component: React.FC<ToolViewProps<Base64ImageInput, Base64ImageOutput>> = ({
  tool,
  initialInput,
  onResult,
}) => {
  const [mode, setMode] = useState<Base64ImageInput['mode']>(initialInput?.mode ?? 'encode');
  const [text, setText] = useState<string>(initialInput?.data ?? '');
  const [result, setResult] = useState<Base64ImageOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setError(null);
    const out = await tool.run({ mode, data: text });
    if (out.ok && out.data) {
      setResult(out.data);
    } else {
      setError(out.error ?? '未知错误');
      setResult(null);
    }
    onResult?.(out);
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      setText(dataUrl);
      void run();
    };
    reader.onerror = () => setError('读取文件失败');
    reader.readAsDataURL(file);
  };

  const previewUrl = mode === 'decode' && result ? result.result : text;

  return (
    <div className="tool-card" style={{ padding: 20, maxWidth: 640 }}>
      <h3 style={{ marginBottom: 16 }}>Base64 图片</h3>

      <div style={{ display: 'grid', gap: 12, maxWidth: 600 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontWeight: 500 }}>
            模式{' '}
            <select
              className="tool-select"
              style={{ width: 'auto' }}
              value={mode}
              onChange={(e) => setMode(e.target.value as Base64ImageInput['mode'])}
            >
              <option value="encode">编码</option>
              <option value="decode">解码</option>
            </select>
          </label>
          {mode === 'encode' && <input type="file" accept="image/*" onChange={onFile} />}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
            {mode === 'encode' ? '数据 URL 或原始 base64' : '待解码的 Base64'}
            <textarea
              className="tool-textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={mode === 'encode' ? 'data:image/png;base64,…' : 'iVBORw0KGgo…'}
              rows={6}
              style={{ fontFamily: 'monospace', width: '100%' }}
            />
          </label>
        </div>

        <button type="button" className="tool-btn" onClick={() => void run()} style={{ marginTop: 4 }}>
          {mode === 'encode' ? '编码' : '解码'}
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
            {result.mimeType && (
              <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>MIME：{result.mimeType}</div>
            )}
            <pre
              style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: 12, maxHeight: 160, overflow: 'auto' }}
            >
              {result.result}
            </pre>
            {mode === 'decode' && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 13, color: '#64748b', marginBottom: 6 }}>预览</div>
                <img
                  src={previewUrl}
                  alt="解码预览"
                  style={{ maxWidth: '100%', maxHeight: 240, border: '1px solid #e2e8f0', borderRadius: 6 }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Component;
