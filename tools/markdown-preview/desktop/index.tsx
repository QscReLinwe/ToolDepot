import type { ToolViewProps } from '@tooldepot/types';
import DOMPurify from 'dompurify';
import type React from 'react';
import { useState } from 'react';
import type { MarkdownPreviewInput, MarkdownPreviewOutput } from '../core/index.js';

const SAMPLE = '# Hello\n\nRender **Markdown** to *HTML*.\n\n- one\n- two\n\n```js\nconsole.log("hi");\n```\n';

export const Component: React.FC<ToolViewProps<MarkdownPreviewInput, MarkdownPreviewOutput>> = ({
  tool,
  initialInput,
  onResult,
}) => {
  const [markdown, setMarkdown] = useState<string>(initialInput?.markdown ?? SAMPLE);
  const [html, setHtml] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const run = async (value: string) => {
    setError(null);
    const out = await tool.run({ markdown: value });
    if (out.ok && out.data) {
      setHtml(out.data.html);
    } else {
      setError(out.error ?? '未知错误');
      setHtml('');
    }
    onResult?.(out);
  };

  return (
    <div className="tool-card" style={{ padding: 20, maxWidth: 900 }}>
      <h3 style={{ marginBottom: 16 }}>Markdown 预览</h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="md-input" style={{ fontWeight: 500, marginBottom: 6 }}>
            Markdown
          </label>
          <textarea
            id="md-input"
            className="tool-textarea"
            value={markdown}
            onChange={(e) => {
              setMarkdown(e.target.value);
              void run(e.target.value);
            }}
            rows={18}
            style={{ width: '100%', fontFamily: 'monospace', flex: 1 }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 500, marginBottom: 6 }}>预览</span>
          <div
            style={{
              flex: 1,
              minHeight: 320,
              overflow: 'auto',
              padding: 16,
              border: '1px solid #e2e8f0',
              borderRadius: 6,
              background: '#fff',
              fontFamily: 'system-ui, sans-serif',
              lineHeight: 1.6,
            }}
            // biome-ignore lint/security/noDangerouslySetInnerHtml: sanitized by DOMPurify
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }}
          />
        </div>
      </div>

      {error && (
        <div
          className="tool-error"
          style={{ color: '#dc2626', marginTop: 12, padding: 12, background: '#fef2f2', borderRadius: 6 }}
        >
          {error}
        </div>
      )}
    </div>
  );
};

export default Component;
