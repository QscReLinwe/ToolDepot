import type { ToolViewProps } from '@tooldepot/types';
import type { FC } from 'react';
import { useState } from 'react';
import type { UrlCodecInput, UrlCodecResult } from '../core/index.js';

export const Component: FC<ToolViewProps<UrlCodecInput, UrlCodecResult>> = ({ tool, initialInput }) => {
  const [text, setText] = useState(initialInput?.text ?? '');
  const [mode, setMode] = useState<UrlCodecInput['mode']>(initialInput?.mode ?? 'encode');
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string>('');

  async function handleRun(): Promise<void> {
    setError('');
    setOutput('');
    const input: UrlCodecInput = { text, mode };
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
        placeholder="粘贴要编码或解码的 URL 字符串"
        rows={10}
        style={{ fontFamily: 'monospace' }}
      />
      <div style={{ display: 'flex', gap: 10, margin: '10px 0', alignItems: 'center', flexWrap: 'wrap' }}>
        <label className="tool-label">
          模式{' '}
          <select
            className="tool-select"
            style={{ width: 'auto' }}
            value={mode}
            onChange={(e) => setMode(e.target.value as UrlCodecInput['mode'])}
          >
            <option value="encode">编码</option>
            <option value="decode">解码</option>
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
