import type { Tool, ToolOutput } from '@tooldepot/types';

export interface UuidGenInput {
  /** 生成数量,默认 1,钳制 1-100 */
  count?: number;
}

export interface UuidGenResult {
  result: string;
}

export const tool: Tool<UuidGenInput, UuidGenResult> = {
  id: 'uuid-gen',
  name: 'UUID 生成器',
  description: '生成随机 UUID (v4)',
  category: 'generator',
  async run(input): Promise<ToolOutput<UuidGenResult>> {
    const raw = input?.count;
    if (raw !== undefined && typeof raw !== 'number') {
      return { ok: false, error: 'count 必须是数字' };
    }
    let count = typeof raw === 'number' ? raw : 1;
    if (!Number.isFinite(count)) {
      return { ok: false, error: 'count 必须是有效数字' };
    }
    count = Math.min(100, Math.max(1, Math.floor(count)));
    const uuids: string[] = [];
    for (let i = 0; i < count; i++) {
      uuids.push(crypto.randomUUID());
    }
    return {
      ok: true,
      data: { result: uuids.join('\n') },
      mimeType: 'text/plain',
    };
  },
};

export default tool;
