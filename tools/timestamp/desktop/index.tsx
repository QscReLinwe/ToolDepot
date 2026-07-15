import type { ToolViewProps } from '@tooldepot/types';
import type { FC } from 'react';
import { useState } from 'react';
import type { TimestampInput, TimestampResult } from '../core/index.js';

export const Component: FC<ToolViewProps<TimestampInput, TimestampResult>> = ({ tool, initialInput }) => {
  const [value, setValue] = useState(initialInput?.value ?? '');
  const [mode, setMode] = useState<TimestampInput['mode']>(initialInput?.mode ?? 'to-date');
  const [unit, setUnit] = useState<TimestampInput['unit']>(initialInput?.unit ?? 'ms');
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string>('');

  async function handleRun(): Promise<void> {
    setError('');
    setOutput('');
    const input: TimestampInput = { value, mode, unit };
    const out = await tool.run(input);
    if (out.ok) {
      setOutput(out.data!.result);
    } else {
      setError(out.error ?? '');
    }
  }

  return (
    <div className="tool-card animate-fade-in-up">
      <input
        className="tool-input"
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="输入时间戳（含毫秒）或日期字符串"
        style={{ fontFamily: 'monospace', fontSize: 15, padding: '10px 12px' }}
      />
      <div style={{ display: 'flex', gap: 10, margin: '10px 0', alignItems: 'center', flexWrap: 'wrap' }}>
        <label className="tool-label">
          模式{' '}
          <select
            className="tool-select"
            style={{ width: 'auto' }}
            value={mode}
            onChange={(e) => setMode(e.target.value as TimestampInput['mode'])}
          >
            <option value="to-date">to-date</option>
            <option value="to-timestamp">to-timestamp</option>
          </select>
        </label>
        <label className="tool-label">
          单位{' '}
          <select
            className="tool-select"
            style={{ width: 'auto' }}
            value={unit}
            onChange={(e) => setUnit(e.target.value as TimestampInput['unit'])}
          >
            <option value="ms">ms</option>
            <option value="s">s</option>
          </select>
        </label>
        <button type="button" className="tool-btn" onClick={() => void handleRun()}>
          运行
        </button>
      </div>
      {error && <pre className="tool-error">{error}</pre>}
      {output && <pre className="tool-result">{output}</pre>}
    </div>
  );
};
