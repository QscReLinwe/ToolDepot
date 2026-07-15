import type { ToolViewProps } from '@tooldepot/types';
import React from 'react';
import type { TemplateInput, TemplateOutput } from '../core/index.js';

export const Component: React.FC<ToolViewProps<TemplateInput, TemplateOutput>> = ({ tool, initialInput, onResult }) => {
  const [text, setText] = React.useState(typeof initialInput?.text === 'string' ? initialInput.text : '');
  const [echo, setEcho] = React.useState<string | null>(null);

  const run = async () => {
    const out = await tool.run({ text });
    if (out.ok) {
      setEcho(out.data!.echo);
    } else {
      setEcho(null);
    }
    onResult?.(out);
  };

  return (
    <div className="tool-card">
      <input
        className="tool-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="输入文本"
        style={{ fontSize: 15, padding: '10px 12px', marginBottom: 10 }}
      />
      <button type="button" className="tool-btn" onClick={run}>
        运行
      </button>
      {echo !== null && <pre className="tool-result">{echo}</pre>}
    </div>
  );
};

export default Component;
