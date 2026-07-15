import type { ToolViewProps } from '@tooldepot/types';
import type { FC } from 'react';
import { useState } from 'react';
import type { BaseConvertInput, BaseConvertResult } from '../core/index.js';

export const Component: FC<ToolViewProps<BaseConvertInput, BaseConvertResult>> = ({ tool, initialInput }) => {
  const [value, setValue] = useState(initialInput?.value ?? '');
  const [from, setFrom] = useState<string>(String(initialInput?.from ?? 10));
  const [to, setTo] = useState<string>(String(initialInput?.to ?? 16));
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string>('');

  async function handleRun(): Promise<void> {
    setError('');
    setOutput('');
    const input: BaseConvertInput = {
      value,
      from: Number(from),
      to: Number(to),
    };
    const out = await tool.run(input);
    if (out.ok) {
      setOutput(out.data!.result);
    } else {
      setError(out.error ?? '');
    }
  }

  return (
    <div className="tool-card animate-fade-in-up">
      <label className="tool-label" style={{ display: 'block', marginBottom: 10 }}>
        数值
        <input
          className="tool-input"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="例如 255 或 FF"
          style={{ fontFamily: 'monospace', fontSize: 15, padding: '10px 12px', marginTop: 4 }}
        />
      </label>
      <div style={{ display: 'flex', gap: 10, margin: '10px 0', alignItems: 'center', flexWrap: 'wrap' }}>
        <label className="tool-label">
          源进制
          <input
            className="tool-input"
            type="number"
            min={2}
            max={36}
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            style={{ width: 70, marginLeft: 4 }}
          />
        </label>
        <label className="tool-label">
          目标进制
          <input
            className="tool-input"
            type="number"
            min={2}
            max={36}
            value={to}
            onChange={(e) => setTo(e.target.value)}
            style={{ width: 70, marginLeft: 4 }}
          />
        </label>
        <button type="button" className="tool-btn" onClick={() => void handleRun()}>
          转换
        </button>
      </div>
      {error && <pre className="tool-error">{error}</pre>}
      {output && <pre className="tool-result">{output}</pre>}
    </div>
  );
};
