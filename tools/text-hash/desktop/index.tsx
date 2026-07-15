import type { ToolViewProps } from '@tooldepot/types';
import type { FC } from 'react';
import { useState } from 'react';
import type { TextHashAlgorithm, TextHashInput, TextHashResult } from '../core/index.js';

export const Component: FC<ToolViewProps<TextHashInput, TextHashResult>> = ({ tool, initialInput }) => {
  const [text, setText] = useState(initialInput?.text ?? '');
  const [algorithm, setAlgorithm] = useState<TextHashAlgorithm>(initialInput?.algorithm ?? 'sha256');
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string>('');

  async function handleRun(): Promise<void> {
    setError('');
    setOutput('');
    const input: TextHashInput = { text, algorithm };
    const out = await tool.run(input);
    if (out.ok) {
      setOutput(out.data!.result);
    } else {
      setError(out.error ?? '');
    }
  }

  return (
    <div className="tool-card animate-fade-in-up">
      <textarea
        className="tool-textarea"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="输入要哈希的文本"
        rows={8}
        style={{ fontFamily: 'monospace' }}
      />
      <div style={{ display: 'flex', gap: 10, margin: '10px 0', alignItems: 'center', flexWrap: 'wrap' }}>
        <label className="tool-label">
          算法{' '}
          <select
            className="tool-select"
            style={{ width: 'auto' }}
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value as TextHashAlgorithm)}
          >
            <option value="sha1">sha1</option>
            <option value="sha256">sha256</option>
            <option value="sha512">sha512</option>
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
