import type { ToolViewProps } from '@tooldepot/types';
import type { FC } from 'react';
import { useState } from 'react';
import type { JsonFormatterInput, JsonFormatterResult } from '../core/index.js';

export const Component: FC<ToolViewProps<JsonFormatterInput, JsonFormatterResult>> = ({ tool, initialInput }) => {
  const [text, setText] = useState(initialInput?.text ?? '');
  const [mode, setMode] = useState<JsonFormatterInput['mode']>(initialInput?.mode ?? 'format');
  const [indent, setIndent] = useState<string>(String(initialInput?.indent ?? 2));
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string>('');

  async function handleRun(): Promise<void> {
    setError('');
    setOutput('');
    const input: JsonFormatterInput = { text, mode };
    if (mode === 'format') {
      const n = Number(indent);
      if (!Number.isNaN(n)) input.indent = n;
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
      <textarea
        className="tool-textarea"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="粘贴 JSON 文本…"
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
            onChange={(e) => setMode(e.target.value as JsonFormatterInput['mode'])}
          >
            <option value="format">格式化</option>
            <option value="compress">压缩</option>
            <option value="validate">校验</option>
          </select>
        </label>
        {mode === 'format' && (
          <label className="tool-label">
            缩进{' '}
            <input
              className="tool-input"
              type="number"
              min={0}
              max={8}
              value={indent}
              onChange={(e) => setIndent(e.target.value)}
              style={{ width: 60 }}
            />
          </label>
        )}
        <button type="button" className="tool-btn" onClick={() => void handleRun()}>
          运行
        </button>
      </div>
      {error && <pre className="tool-error">{error}</pre>}
      {output && <pre className="tool-result">{output}</pre>}
    </div>
  );
};
