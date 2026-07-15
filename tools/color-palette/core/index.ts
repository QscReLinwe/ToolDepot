import type { Tool, ToolInput, ToolOutput } from '@tooldepot/types';

export type ColorScheme = 'complementary' | 'analogous' | 'triadic' | 'tetradic' | 'monochromatic';

export interface ColorPaletteInput extends ToolInput {
  /** Base color as a hex string, e.g. '#3b82f6' or '3b82f6'. */
  baseColor: string;
  /** Color harmony scheme to generate. */
  scheme: ColorScheme;
}

export interface ColorSwatch {
  hex: string;
  hsl: string;
}

export interface ColorPaletteOutput {
  colors: ColorSwatch[];
}

interface Hsl {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

const SCHEMES: ColorScheme[] = ['complementary', 'analogous', 'triadic', 'tetradic', 'monochromatic'];

function normalizeHex(input: string): string | null {
  if (typeof input !== 'string') return null;
  let hex = input.trim().replace(/^#/, '').toLowerCase();
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (!/^[0-9a-f]{6}$/.test(hex)) return null;
  return `#${hex}`;
}

function hexToHsl(hex: string): Hsl {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === r) {
      h = ((g - b) / delta) % 6;
    } else if (max === g) {
      h = (b - r) / delta + 2;
    } else {
      h = (r - g) / delta + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }

  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

function hslToHex(h: number, s: number, l: number): string {
  const hue = ((h % 360) + 360) % 360;
  const sat = Math.min(100, Math.max(0, s)) / 100;
  const lig = Math.min(100, Math.max(0, l)) / 100;

  const c = (1 - Math.abs(2 * lig - 1)) * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = lig - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;
  if (hue < 60) {
    [r, g, b] = [c, x, 0];
  } else if (hue < 120) {
    [r, g, b] = [x, c, 0];
  } else if (hue < 180) {
    [r, g, b] = [0, c, x];
  } else if (hue < 240) {
    [r, g, b] = [0, x, c];
  } else if (hue < 300) {
    [r, g, b] = [x, 0, c];
  } else {
    [r, g, b] = [c, 0, x];
  }

  const toHex = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, '0');

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function formatHsl(h: number, s: number, l: number): string {
  return `hsl(${Math.round(((h % 360) + 360) % 360)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
}

function buildSwatch(h: number, s: number, l: number): ColorSwatch {
  return {
    hex: hslToHex(h, s, l),
    hsl: formatHsl(h, s, l),
  };
}

function generate(base: Hsl, scheme: ColorScheme): ColorSwatch[] {
  switch (scheme) {
    case 'complementary':
      return [buildSwatch(base.h, base.s, base.l), buildSwatch(base.h + 180, base.s, base.l)];
    case 'analogous':
      return [
        buildSwatch(base.h - 30, base.s, base.l),
        buildSwatch(base.h, base.s, base.l),
        buildSwatch(base.h + 30, base.s, base.l),
      ];
    case 'triadic':
      return [
        buildSwatch(base.h, base.s, base.l),
        buildSwatch(base.h + 120, base.s, base.l),
        buildSwatch(base.h + 240, base.s, base.l),
      ];
    case 'tetradic':
      return [
        buildSwatch(base.h, base.s, base.l),
        buildSwatch(base.h + 90, base.s, base.l),
        buildSwatch(base.h + 180, base.s, base.l),
        buildSwatch(base.h + 270, base.s, base.l),
      ];
    case 'monochromatic': {
      const lights = [25, 40, 55, 70, 85];
      return lights.map((l) => buildSwatch(base.h, base.s, l));
    }
    default:
      return [buildSwatch(base.h, base.s, base.l)];
  }
}

export const tool: Tool<ColorPaletteInput, ColorPaletteOutput> = {
  id: 'color-palette',
  name: '配色方案生成',
  description: '基于主色生成配色方案。',
  category: 'design',
  async run(input) {
    const baseColor = input?.baseColor;
    const scheme = input?.scheme;

    if (typeof baseColor !== 'string' || !baseColor.trim()) {
      return { ok: false, error: 'baseColor is required (hex string)' };
    }
    const hex = normalizeHex(baseColor);
    if (!hex) {
      return { ok: false, error: `Invalid hex color: "${baseColor}"` };
    }
    if (typeof scheme !== 'string' || !SCHEMES.includes(scheme as ColorScheme)) {
      return {
        ok: false,
        error: `Invalid scheme. Must be one of: ${SCHEMES.join(', ')}`,
      };
    }

    const base = hexToHsl(hex);
    const colors = generate(base, scheme as ColorScheme);

    const output: ToolOutput<ColorPaletteOutput> = {
      ok: true,
      data: { colors },
      mimeType: 'application/json',
    };
    return output;
  },
};

export default tool;
