import type { ToolOutput } from '@tooldepot/types';

export interface ScreenColorPickerInput {
  hex?: string;
}

export interface ScreenColorPickerOutput {
  hex: string;
  rgb: string;
  hsl: string;
}

interface Rgb {
  r: number;
  g: number;
  b: number;
}

function clampByte(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function parseColor(input: string): Rgb | null {
  const raw = input.trim().toLowerCase();
  if (!raw) return null;

  const hexMatch = raw.replace(/^#/, '').match(/^([0-9a-f]{3}|[0-9a-f]{6})$/);
  if (hexMatch) {
    let h = hexMatch[1] ?? '';
    if (h.length === 3) {
      h = h
        .split('')
        .map((c) => c + c)
        .join('');
    }
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    };
  }

  const rgbMatch = raw.match(/^rgba?\(\s*([\d.]+(?:\s*,\s*[\d.]+){2,3})\s*\)$/);
  if (rgbMatch) {
    const parts = (rgbMatch[1] ?? '').split(',').map((p) => parseFloat(p.trim()));
    if (parts.length >= 3 && parts.slice(0, 3).every((n) => !Number.isNaN(n))) {
      return { r: clampByte(parts[0] ?? 0), g: clampByte(parts[1] ?? 0), b: clampByte(parts[2] ?? 0) };
    }
  }

  return null;
}

function toHex({ r, g, b }: Rgb): string {
  const h = (n: number) => clampByte(n).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}

function toRgbString({ r, g, b }: Rgb): string {
  return `rgb(${clampByte(r)}, ${clampByte(g)}, ${clampByte(b)})`;
}

function toHslString({ r, g, b }: Rgb): string {
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

export const tool = {
  id: 'screen-color-picker',
  name: '屏幕取色器',
  description: '通过 EyeDropper 取色并转换 hex/rgb/hsl。',
  category: 'utility',
  async run(input: ScreenColorPickerInput): Promise<ToolOutput<ScreenColorPickerOutput>> {
    const raw = input?.hex;
    if (typeof raw !== 'string' || raw.trim() === '') {
      return { ok: false, error: 'Provide a color string (hex or rgb)' };
    }

    const rgb = parseColor(raw);
    if (!rgb) {
      return { ok: false, error: `Could not parse color: ${raw}` };
    }

    return {
      ok: true,
      data: {
        hex: toHex(rgb),
        rgb: toRgbString(rgb),
        hsl: toHslString(rgb),
      },
      mimeType: 'application/json',
    };
  },
};

export default tool;
