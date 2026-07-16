import type { Tool, ToolOutput } from '@tooldepot/types';

export type ColorFormat = 'auto' | 'hex' | 'rgb' | 'hsl' | 'hsv' | 'cmyk';

export interface ColorConverterInput {
  /** A color string in any supported format. */
  input: string;
  /** Source format; 'auto' detects from the string. */
  from?: ColorFormat;
}

export interface ColorConverterOutput {
  hex: string;
  rgb: string;
  hsl: string;
  hsv: string;
  cmyk: string;
}

interface Rgb {
  r: number;
  g: number;
  b: number;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function parseHex(input: string): Rgb | null {
  const m = input
    .trim()
    .toLowerCase()
    .replace(/^#/, '')
    .match(/^([0-9a-f]{3}|[0-9a-f]{6})$/);
  if (!m) return null;
  let h = m[1] ?? '';
  if (h.length === 3)
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
}

function parseRgb(input: string): Rgb | null {
  const m = input
    .trim()
    .toLowerCase()
    .match(/^rgba?\(\s*([^)]+)\s*\)$/);
  if (!m) return null;
  const p = (m[1] ?? '').split(',').map((s) => parseFloat(s.trim()));
  if (p.length < 3 || p.slice(0, 3).some((n) => Number.isNaN(n))) return null;
  return { r: clamp(p[0] ?? 0, 0, 255), g: clamp(p[1] ?? 0, 0, 255), b: clamp(p[2] ?? 0, 0, 255) };
}

function parseHsl(input: string): Rgb | null {
  const m = input
    .trim()
    .toLowerCase()
    .match(/^hsla?\(\s*([^)]+)\s*\)$/);
  if (!m) return null;
  const p = (m[1] ?? '').split(',').map((s) => parseFloat(s.replace('%', '').trim()));
  if (p.length < 3 || p.slice(0, 3).some((n) => Number.isNaN(n))) return null;
  return hslToRgb(p[0] ?? 0, (p[1] ?? 0) / 100, (p[2] ?? 0) / 100);
}

function parseHsv(input: string): Rgb | null {
  const m = input
    .trim()
    .toLowerCase()
    .match(/^hsva?\(\s*([^)]+)\s*\)$/);
  if (!m) return null;
  const p = (m[1] ?? '').split(',').map((s) => parseFloat(s.replace('%', '').trim()));
  if (p.length < 3 || p.slice(0, 3).some((n) => Number.isNaN(n))) return null;
  return hsvToRgb(p[0] ?? 0, (p[1] ?? 0) / 100, (p[2] ?? 0) / 100);
}

function parseCmyk(input: string): Rgb | null {
  const m = input
    .trim()
    .toLowerCase()
    .match(/^cmyka?\(\s*([^)]+)\s*\)$/);
  if (!m) return null;
  const p = (m[1] ?? '').split(',').map((s) => parseFloat(s.replace('%', '').trim()));
  if (p.length < 4 || p.slice(0, 4).some((n) => Number.isNaN(n))) return null;
  const scale = p.slice(0, 4).some((n) => n > 1) ? 100 : 1;
  const c = (p[0] ?? 0) / scale;
  const mm = (p[1] ?? 0) / scale;
  const y = (p[2] ?? 0) / scale;
  const k = (p[3] ?? 0) / scale;
  return {
    r: Math.round(255 * (1 - c) * (1 - k)),
    g: Math.round(255 * (1 - mm) * (1 - k)),
    b: Math.round(255 * (1 - y) * (1 - k)),
  };
}

function hslToRgb(h: number, s: number, l: number): Rgb {
  const hp = (((h % 360) + 360) % 360) / 360;
  let r: number;
  let g: number;
  let b: number;
  if (s === 0) {
    r = g = b = l;
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const hue = (t: number) => {
      let tt = t;
      if (tt < 0) tt += 1;
      if (tt > 1) tt -= 1;
      if (tt < 1 / 6) return p + (q - p) * 6 * tt;
      if (tt < 1 / 2) return q;
      if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
      return p;
    };
    r = hue(hp + 1 / 3);
    g = hue(hp);
    b = hue(hp - 1 / 3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

function hsvToRgb(h: number, s: number, v: number): Rgb {
  const hp = (((h % 360) + 360) % 360) / 60;
  const c = v * s;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  const m = v - c;
  let r = 0;
  let g = 0;
  let b = 0;
  if (hp >= 0 && hp < 1) {
    r = c;
    g = x;
  } else if (hp >= 1 && hp < 2) {
    r = x;
    g = c;
  } else if (hp >= 2 && hp < 3) {
    g = c;
    b = x;
  } else if (hp >= 3 && hp < 4) {
    g = x;
    b = c;
  } else if (hp >= 4 && hp < 5) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }
  return { r: Math.round((r + m) * 255), g: Math.round((g + m) * 255), b: Math.round((b + m) * 255) };
}

function rgbToHex({ r, g, b }: Rgb): string {
  const h = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}

function rgbToRgbString({ r, g, b }: Rgb): string {
  return `rgb(${clamp(Math.round(r), 0, 255)}, ${clamp(Math.round(g), 0, 255)}, ${clamp(Math.round(b), 0, 255)})`;
}

function rgbToHslString({ r, g, b }: Rgb): string {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  let h = 0;
  if (delta !== 0) {
    if (max === rn) h = ((gn - bn) / delta) % 6;
    else if (max === gn) h = (bn - rn) / delta + 2;
    else h = (rn - gn) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  return `hsl(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

function rgbToHsvString({ r, g, b }: Rgb): string {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  let h = 0;
  if (delta !== 0) {
    if (max === rn) h = ((gn - bn) / delta) % 6;
    else if (max === gn) h = (bn - rn) / delta + 2;
    else h = (rn - gn) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : delta / max;
  return `hsv(${Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(max * 100)}%)`;
}

function rgbToCmykString({ r, g, b }: Rgb): string {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const k = 1 - Math.max(rn, gn, bn);
  if (k === 1) return 'cmyk(0%, 0%, 0%, 100%)';
  const c = (1 - rn - k) / (1 - k);
  const m = (1 - gn - k) / (1 - k);
  const y = (1 - bn - k) / (1 - k);
  return `cmyk(${Math.round(c * 100)}%, ${Math.round(m * 100)}%, ${Math.round(y * 100)}%, ${Math.round(k * 100)}%)`;
}

function detectFormat(input: string): ColorFormat {
  const s = input.trim().toLowerCase();
  if (/^#?[0-9a-f]{3}$/.test(s.replace(/^#/, '')) || /^#?[0-9a-f]{6}$/.test(s.replace(/^#/, ''))) return 'hex';
  if (/^rgba?\(/.test(s)) return 'rgb';
  if (/^hsla?\(/.test(s)) return 'hsl';
  if (/^hsva?\(/.test(s)) return 'hsv';
  if (/^cmyka?\(/.test(s)) return 'cmyk';
  return 'auto';
}

function parseToRgb(input: string, from: ColorFormat): Rgb | null {
  const fmt = from === 'auto' ? detectFormat(input) : from;
  switch (fmt) {
    case 'hex':
      return parseHex(input);
    case 'rgb':
      return parseRgb(input);
    case 'hsl':
      return parseHsl(input);
    case 'hsv':
      return parseHsv(input);
    case 'cmyk':
      return parseCmyk(input);
    default:
      return parseHex(input) || parseRgb(input) || parseHsl(input) || parseHsv(input) || parseCmyk(input);
  }
}

export const tool: Tool<ColorConverterInput, ColorConverterOutput> = {
  id: 'color-converter',
  name: '颜色转换器',
  description: '在 hex/rgb/hsl/hsv/cmyk 间转换颜色。',
  category: 'convert',
  async run(input: ColorConverterInput): Promise<ToolOutput<ColorConverterOutput>> {
    const raw = input?.input;
    const from = input?.from ?? 'auto';

    if (typeof raw !== 'string' || raw.trim() === '') {
      return { ok: false, error: 'Provide a color string to convert' };
    }

    const rgb = parseToRgb(raw, from);
    if (!rgb) {
      return { ok: false, error: `Could not parse color as ${from === 'auto' ? 'any known format' : from}: ${raw}` };
    }

    return {
      ok: true,
      data: {
        hex: rgbToHex(rgb),
        rgb: rgbToRgbString(rgb),
        hsl: rgbToHslString(rgb),
        hsv: rgbToHsvString(rgb),
        cmyk: rgbToCmykString(rgb),
      },
      mimeType: 'application/json',
    };
  },
};

export default tool;
