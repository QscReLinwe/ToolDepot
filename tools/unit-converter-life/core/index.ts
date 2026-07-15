import type { ToolOutput } from '@tooldepot/types';

export type LifeCategory = 'cooking' | 'length' | 'area';

export interface UnitConverterLifeInput {
  category: LifeCategory;
  from?: string;
  to?: string;
  value?: number;
}

export interface UnitConverterLifeOutput {
  value: number;
  from: string;
  to: string;
  result: number;
  formula?: string;
}

interface UnitDef {
  /** Canonical base unit this unit converts through. */
  base: string;
  /** Factor to convert 1 of this unit into 1 of the base unit. */
  factor: number;
}

/**
 * Factor table. Each unit maps to a base unit within its category; conversions
 * are only valid between units sharing the same base (same physical dimension).
 */
const FACTORS: Record<LifeCategory, Record<string, UnitDef>> = {
  cooking: {
    // volume → ml
    cup: { base: 'ml', factor: 236.588 },
    tbsp: { base: 'ml', factor: 14.7868 },
    tsp: { base: 'ml', factor: 4.92892 },
    ml: { base: 'ml', factor: 1 },
    // mass → g
    oz: { base: 'g', factor: 28.3495 },
    g: { base: 'g', factor: 1 },
    lb: { base: 'kg', factor: 0.453592 },
    kg: { base: 'kg', factor: 1 },
  },
  length: {
    inch: { base: 'm', factor: 0.0254 },
    ft: { base: 'm', factor: 0.3048 },
    yd: { base: 'm', factor: 0.9144 },
    mile: { base: 'm', factor: 1609.344 },
    cm: { base: 'm', factor: 0.01 },
    m: { base: 'm', factor: 1 },
    km: { base: 'm', factor: 1000 },
  },
  area: {
    sqft: { base: 'sqm', factor: 0.092903 },
    sqm: { base: 'sqm', factor: 1 },
  },
};

function isFiniteNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

export const tool = {
  id: 'unit-converter-life',
  name: '生活单位换算',
  description: '转换日常单位：烹饪、长度、面积。',
  category: 'convert',
  async run(input: UnitConverterLifeInput): Promise<ToolOutput<UnitConverterLifeOutput>> {
    const category = input?.category;
    const from = input?.from;
    const to = input?.to;
    const value = input?.value;

    const catTable = FACTORS[category as LifeCategory];
    if (!catTable) {
      return { ok: false, error: "category must be 'cooking', 'length', or 'area'" };
    }
    if (typeof from !== 'string' || !catTable[from]) {
      return { ok: false, error: `unknown 'from' unit '${String(from)}' for category '${category}'` };
    }
    if (typeof to !== 'string' || !catTable[to]) {
      return { ok: false, error: `unknown 'to' unit '${String(to)}' for category '${category}'` };
    }
    if (!isFiniteNumber(value)) {
      return { ok: false, error: 'value must be a number' };
    }

    const fromDef = catTable[from]!;
    const toDef = catTable[to]!;
    if (fromDef.base !== toDef.base) {
      return { ok: false, error: `cannot convert '${from}' (${fromDef.base}) to '${to}' (${toDef.base})` };
    }

    const result = (value * fromDef.factor) / toDef.factor;
    const unitFactor = fromDef.factor / toDef.factor;

    return {
      ok: true,
      data: {
        value,
        from,
        to,
        result,
        formula: `1 ${from} = ${unitFactor} ${to}`,
      },
      mimeType: 'application/json',
    };
  },
};

export default tool;
