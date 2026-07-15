import { describe, expect, it } from 'vitest';
import { tool } from './index';

describe('uuid-gen', () => {
  it('should return a single UUID by default', async () => {
    const result = await tool.run({});
    expect(result.ok).toBe(true);
    expect(result.data?.result).toBeDefined();
    // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    expect(result.data!.result).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it('should generate multiple UUIDs when count is specified', async () => {
    const result = await tool.run({ count: 3 });
    expect(result.ok).toBe(true);
    const uuids = result.data!.result.split('\n');
    expect(uuids).toHaveLength(3);
    uuids.forEach((uuid) => {
      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    });
  });

  it('should clamp count to 1-100 range', async () => {
    const below = await tool.run({ count: 0 });
    expect(below.data!.result.split('\n')).toHaveLength(1);

    const above = await tool.run({ count: 200 });
    expect(above.data!.result.split('\n')).toHaveLength(100);
  });

  it('should return error for invalid count', async () => {
    const result = await tool.run({ count: 'abc' as unknown as number });
    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should return error for non-finite count', async () => {
    const result = await tool.run({ count: Infinity });
    expect(result.ok).toBe(false);
    expect(result.error).toBeDefined();
  });
});
