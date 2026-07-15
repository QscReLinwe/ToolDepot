import type { Tool, ToolInput, ToolOutput } from '@tooldepot/types';

export interface TemplateInput extends ToolInput {
  text: string;
}

export interface TemplateOutput {
  echo: string;
}

export const tool: Tool<TemplateInput, TemplateOutput> = {
  id: 'template',
  name: '模板工具 (Template)',
  description: '标准工具结构示例: core 实现 + cli 入口 + desktop 组件',
  category: 'utility',
  async run(input) {
    const text = typeof input?.text === 'string' ? input.text : '';
    const output: ToolOutput<TemplateOutput> = {
      ok: true,
      data: { echo: text },
    };
    return output;
  },
};

export default tool;
