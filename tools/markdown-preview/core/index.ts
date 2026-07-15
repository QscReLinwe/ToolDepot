import type { ToolOutput } from '@tooldepot/types';
import { marked } from 'marked';

export interface MarkdownPreviewInput {
  /** Markdown source to render. */
  markdown: string;
}

export interface MarkdownPreviewOutput {
  /** Rendered HTML. */
  html: string;
}

export const tool = {
  id: 'markdown-preview',
  name: 'Markdown 预览',
  description: '将 Markdown 实时渲染为 HTML。',
  category: 'format',
  async run(input: MarkdownPreviewInput): Promise<ToolOutput<MarkdownPreviewOutput>> {
    const markdown = typeof input?.markdown === 'string' ? input.markdown : '';

    try {
      const html = await marked.parse(markdown);
      return {
        ok: true,
        data: { html: typeof html === 'string' ? html : String(html) },
        mimeType: 'text/html',
      };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  },
};

export default tool;
