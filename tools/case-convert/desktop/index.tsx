import type { ToolViewProps } from '@tooldepot/types';
import type { FC } from 'react';
import { useState } from 'react';
import type { CaseConvertInput, CaseConvertResult, CaseStyle } from '../core/index.js';

const STYLES: CaseStyle[] = ['camel', 'snake', 'pascal', 'kebab'];

export const Component: FC<ToolViewProps<CaseConvertInput, CaseConvertResult>> = ({ tool, initialInput }) => {
  const [text, setText] = useState(initialInput?.text ?? '');
  const [from, setFrom] = useState<CaseStyle>(initialInput?.from ?? 'camel');
  const [to, setTo] = useState<CaseStyle>(initialInput?.to ?? 'snake');
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string>('');

  async function handleRun(): Promise<void> {
    setError('');
    setOutput('');
    const input: CaseConvertInput = { text, from, to };
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
        placeholder="输入要转换的文本…"
        rows={6}
        style={{ fontFamily: 'monospace' }}
      />
      <div style={{ display: 'flex', gap: 10, margin: '10px 0', alignItems: 'center', flexWrap: 'wrap' }}>
        <label className="tool-label">
          源格式{' '}
          <select
            className="tool-select"
            style={{ width: 'auto' }}
            value={from}
            onChange={(e) => setFrom(e.target.value as CaseStyle)}
          >
            {STYLES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="tool-label">
          目标格式{' '}
          <select
            className="tool-select"
            style={{ width: 'auto' }}
            value={to}
            onChange={(e) => setTo(e.target.value as CaseStyle)}
          >
            {STYLES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
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
