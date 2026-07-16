import type { Tool, ToolOutput } from '@tooldepot/types';

export type UnitCategory =
  | 'length'
  | 'mass'
  | 'temperature'
  | 'area'
  | 'volume'
  | 'speed'
  | 'data'
  | 'time'
  | 'pressure';

export interface UnitConverterInput {
  category: UnitCategory;
  from: string;
  to: string;
  value: number;
}

export interface UnitConverterOutput {
  value: number;
  from: string;
  to: string;
  result: number;
  formula?: string;
}

type FactorTable = Record<string, number>;

interface CategoryDef {
  units: string[];
  factors?: FactorTable;
  convert?: (value: number, from: string, to: string) => number;
}

const CATEGORIES: Record<UnitCategory, CategoryDef> = {
  length: {
    units: ['mm', 'cm', 'm', 'km', 'in', 'ft', 'yd', 'mi'],
    factors: { mm: 0.001, cm: 0.01, m: 1, km: 1000, in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.344 },
  },
  mass: {
    units: ['mg', 'g', 'kg', 't', 'oz', 'lb'],
    factors: { mg: 0.001, g: 1, kg: 1000, t: 1e6, oz: 28.349523125, lb: 453.59237 },
  },
  temperature: {
    units: ['C', 'F', 'K'],
    convert: (value, from, to) => {
      const c = from === 'C' ? value : from === 'F' ? ((value - 32) * 5) / 9 : value - 273.15;
      return to === 'C' ? c : to === 'F' ? (c * 9) / 5 + 32 : c + 273.15;
    },
  },
  area: {
    units: ['mm2', 'cm2', 'm2', 'km2', 'ha', 'ac', 'ft2', 'in2', 'mi2'],
    factors: {
      mm2: 1e-6,
      cm2: 1e-4,
      m2: 1,
      km2: 1e6,
      ha: 10000,
      ac: 4046.8564224,
      ft2: 0.09290304,
      in2: 0.00064516,
      mi2: 2589988.110336,
    },
  },
  volume: {
    units: ['ml', 'l', 'm3', 'cm3', 'gal', 'qt', 'pt', 'cup', 'floz', 'ukgal'],
    factors: {
      ml: 0.001,
      l: 1,
      m3: 1000,
      cm3: 0.001,
      gal: 3.785411784,
      qt: 0.946352946,
      pt: 0.473176473,
      cup: 0.2365882365,
      floz: 0.0295735295625,
      ukgal: 4.54609,
    },
  },
  speed: {
    units: ['mps', 'kph', 'mph', 'fps', 'knot'],
    factors: { mps: 1, kph: 1000 / 3600, mph: 0.44704, fps: 0.3048, knot: 0.514444444 },
  },
  data: {
    units: ['b', 'B', 'KB', 'MB', 'GB', 'TB', 'KiB', 'MiB', 'GiB', 'TiB'],
    factors: {
      b: 0.125,
      B: 1,
      KB: 1e3,
      MB: 1e6,
      GB: 1e9,
      TB: 1e12,
      KiB: 1024,
      MiB: 1048576,
      GiB: 1073741824,
      TiB: 1099511627776,
    },
  },
  time: {
    units: ['ms', 's', 'min', 'h', 'day', 'week'],
    factors: { ms: 0.001, s: 1, min: 60, h: 3600, day: 86400, week: 604800 },
  },
  pressure: {
    units: ['pa', 'kpa', 'mpa', 'bar', 'atm', 'psi', 'torr'],
    factors: { pa: 1, kpa: 1000, mpa: 1e6, bar: 100000, atm: 101325, psi: 6894.757293168, torr: 133.322368421 },
  },
};

export const tool: Tool<UnitConverterInput, UnitConverterOutput> = {
  id: 'unit-converter',
  name: '单位换算器',
  description: '在长度、质量、温度等单位间转换。',
  category: 'convert',
  async run(input: UnitConverterInput): Promise<ToolOutput<UnitConverterOutput>> {
    const category = input?.category;
    const from = input?.from;
    const to = input?.to;
    const value = input?.value;

    if (!category || !(category in CATEGORIES)) {
      return { ok: false, error: 'Invalid or missing category' };
    }
    if (typeof from !== 'string' || typeof to !== 'string') {
      return { ok: false, error: 'Missing required fields: from, to' };
    }
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return { ok: false, error: 'value must be a finite number' };
    }

    const def = CATEGORIES[category];
    if (!def.units.includes(from) || !def.units.includes(to)) {
      return { ok: false, error: `Units must belong to category '${category}': ${def.units.join(', ')}` };
    }

    let result: number;
    let formula: string | undefined;
    if (def.convert) {
      result = def.convert(value, from, to);
      formula = `${value} ${from} → ${to}`;
    } else {
      const factors = def.factors as FactorTable;
      const factor = factors[from]! / factors[to]!;
      result = value * factor;
      formula = `1 ${from} = ${factors[from]! / factors[to]!} ${to}`;
    }

    const rounded = Math.round(result * 1e10) / 1e10;

    return {
      ok: true,
      data: { value, from, to, result: rounded, formula },
      mimeType: 'application/json',
    };
  },
};

export default tool;
