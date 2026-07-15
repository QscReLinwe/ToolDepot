import type { ToolViewProps } from '@tooldepot/types';
import type { FC } from 'react';
import { useState } from 'react';
import type { UuidGenInput, UuidGenResult } from '../core/index.js';

export const Component: FC<ToolViewProps<UuidGenInput, UuidGenResult>> = ({ tool, initialInput }) => {
  const [count, setCount] = useState<string>(String(initialInput?.count ?? 1));
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string>('');

  async function handleRun(): Promise<void> {
    setError('');
    setOutput('');
    const n = Number(count);
    const input: UuidGenInput = {};
    if (!Number.isNaN(n)) {
      input.count = n;
    }
    const out = await tool.run(input);
    if (out.ok) {
      setOutput(out.data!.result);
    } else {
      setError(out.error ?? '');
    }
  }

  return (
    <div className="tool-card animate-fade-in-up">
      <div style={{ display: 'flex', gap: 10, margin: '0 0 10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <label className="tool-label">
          数量{' '}
          <input
            className="tool-input"
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(e.target.value)}
            style={{ width: 80 }}
          />
        </label>
        <button type="button" className="tool-btn" onClick={() => void handleRun()}>
          生成 UUID
        </button>
      </div>
      {error && <pre className="tool-error">{error}</pre>}
      {output && <pre className="tool-result">{output}</pre>}
    </div>
  );
};
