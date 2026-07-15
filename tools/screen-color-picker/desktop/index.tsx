import type { ToolViewProps } from '@tooldepot/types';
import type React from 'react';
import { useState } from 'react';
import type { ScreenColorPickerInput, ScreenColorPickerOutput } from '../core/index.js';

interface EyeDropperResult {
  sRGBHex: string;
}
interface EyeDropper {
  open(options?: { signal?: AbortSignal }): Promise<EyeDropperResult>;
}
declare global {
  interface Window {
    EyeDropper?: { new (): EyeDropper };
  }
}

export const Component: React.FC<ToolViewProps<ScreenColorPickerInput, ScreenColorPickerOutput>> = ({
  tool,
  initialInput,
  onResult,
}) => {
  const [hex, setHex] = useState<string>(initialInput?.hex ?? '#ff0000');
  const [result, setResult] = useState<ScreenColorPickerOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);

  const run = async (color: string) => {
    setError(null);
    const out = await tool.run({ hex: color });
    if (out.ok && out.data) {
      setResult(out.data);
      setHex(out.data.hex);
    } else {
      setError(out.error ?? '未知错误');
      setResult(null);
    }
    onResult?.(out);
  };

  const pickWithEyeDropper = async () => {
    if (typeof window === 'undefined' || !window.EyeDropper) {
      setError('当前浏览器不支持 EyeDropper API — 请使用下方的颜色选择器');
      return;
    }
    setPicking(true);
    try {
      const ed = new window.EyeDropper();
      const picked = await ed.open();
      await run(picked.sRGBHex);
    } catch (e) {
      // user cancelled — ignore AbortError
      if (!(e instanceof Error && e.name === 'AbortError')) {
        setError(e instanceof Error ? e.message : String(e));
      }
    } finally {
      setPicking(false);
    }
  };

  const eyeDropperSupported = typeof window !== 'undefined' && !!window.EyeDropper;

  return (
    <div className="tool-card" style={{ padding: 20, maxWidth: 600 }}>
      <h3 style={{ marginBottom: 16 }}>屏幕取色器</h3>

      <div style={{ display: 'grid', gap: 12, maxWidth: 500 }}>
        <button
          type="button"
          className="tool-btn"
          onClick={() => void pickWithEyeDropper()}
          disabled={picking || !eyeDropperSupported}
          style={{ marginTop: 4 }}
        >
          {picking ? '取色中…' : '拾取屏幕颜色'}
        </button>
        {!eyeDropperSupported && (
          <div style={{ fontSize: 13, color: '#64748b' }}>EyeDropper API 不可用 — 请使用下方的原生颜色选择器</div>
        )}

        <div>
          <label htmlFor="scp-color" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
            或选择一种颜色
          </label>
          <input
            id="scp-color"
            type="color"
            value={hex}
            onChange={(e) => {
              void run(e.target.value);
            }}
            style={{ width: 60, height: 40, padding: 0, border: 'none', background: 'none', cursor: 'pointer' }}
          />
          <input
            className="tool-input"
            value={hex}
            onChange={(e) => setHex(e.target.value)}
            placeholder="#ff0000"
            style={{
              width: 'calc(100% - 72px)',
              fontSize: 15,
              padding: '10px 12px',
              marginLeft: 12,
              fontFamily: 'monospace',
            }}
          />
        </div>

        <button type="button" className="tool-btn" onClick={() => void run(hex)} style={{ marginTop: 4 }}>
          转换
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div
                style={{ width: 48, height: 48, borderRadius: 8, border: '1px solid #e2e8f0', background: result.hex }}
              />
              <div style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 600 }}>{result.hex}</div>
            </div>
            <div style={{ display: 'grid', gap: 6, fontSize: 14 }}>
              <div>
                <span style={{ color: '#64748b' }}>RGB：</span>
                <span style={{ fontFamily: 'monospace' }}>{result.rgb}</span>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>HSL：</span>
                <span style={{ fontFamily: 'monospace' }}>{result.hsl}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Component;
