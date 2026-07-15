import type { Tool, ToolInput, ToolOutput } from '@tooldepot/types';

export type GradientType = 'linear' | 'radial';

export interface GradientStop {
  color: string;
  /** Position along the gradient, 0-100. */
  position: number;
}

export interface GradientGenInput extends ToolInput {
  type: GradientType;
  /** Angle in degrees for linear gradients (default 90). */
  angle?: number;
  stops: GradientStop[];
}

export interface GradientGenOutput {
  css: string;
}

function isValidColor(c: string): boolean {
  if (typeof c !== 'string') return false;
  const s = c.trim();
  return (
    /^#[0-9a-f]{3}$/i.test(s) ||
    /^#[0-9a-f]{6}$/i.test(s) ||
    /^#[0-9a-f]{8}$/i.test(s) ||
    /^rgba?\(/i.test(s) ||
    /^hsla?\(/i.test(s)
  );
}

export const tool: Tool<GradientGenInput, GradientGenOutput> = {
  id: 'gradient-gen',
  name: '渐变色生成器',
  description: '基于色标生成 CSS 渐变。',
  category: 'design',
  async run(input) {
    const type = input?.type;
    const stops = input?.stops;

    if (type !== 'linear' && type !== 'radial') {
      return { ok: false, error: "type must be 'linear' or 'radial'" };
    }
    if (!Array.isArray(stops) || stops.length < 2) {
      return { ok: false, error: 'At least 2 color stops are required' };
    }

    const cleanStops: GradientStop[] = [];
    for (const stop of stops) {
      if (!stop || typeof stop.color !== 'string' || typeof stop.position !== 'number') {
        return { ok: false, error: 'Each stop needs a color (string) and position (number)' };
      }
      if (!isValidColor(stop.color)) {
        return { ok: false, error: `Invalid color: "${stop.color}"` };
      }
      const pos = Math.min(100, Math.max(0, stop.position));
      cleanStops.push({ color: stop.color.trim(), position: pos });
    }

    cleanStops.sort((a, b) => a.position - b.position);

    const stopStr = cleanStops.map((s) => `${s.color} ${Math.round(s.position)}%`).join(', ');

    const angle = typeof input?.angle === 'number' ? input.angle : 90;
    const css =
      type === 'linear'
        ? `linear-gradient(${Math.round(angle)}deg, ${stopStr})`
        : `radial-gradient(circle, ${stopStr})`;

    const output: ToolOutput<GradientGenOutput> = {
      ok: true,
      data: { css },
      mimeType: 'application/json',
    };
    return output;
  },
};

export default tool;
