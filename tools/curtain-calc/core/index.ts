import type { ToolOutput } from '@tooldepot/types';

export interface CurtainCalcInput {
  windowWidthCm?: number;
  windowHeightCm?: number;
  /** Pleat fullness multiple (default 2.0). */
  fullness?: number;
  /** Hem allowance added to the drop, in cm (default 15). */
  hemCm?: number;
  /** Width of a fabric bolt in cm (default 140). */
  fabricWidthCm?: number;
}

export interface CurtainCalcOutput {
  /** Total fabric width needed across all panels (windowWidth × fullness). */
  fabricWidthCm: number;
  /** Fabric length needed per panel (windowHeight + hem). */
  fabricLengthCm: number;
  /** Number of fabric panels (bolts) required. */
  panels?: number;
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

export const tool = {
  id: 'curtain-calc',
  name: '窗帘用量计算',
  description: '计算窗帘布料宽度、长度与幅数（含褶皱与卷边）。',
  category: 'home',
  async run(input: CurtainCalcInput): Promise<ToolOutput<CurtainCalcOutput>> {
    const windowWidthCm = input?.windowWidthCm;
    const windowHeightCm = input?.windowHeightCm;
    const fullness = input?.fullness ?? 2.0;
    const hemCm = input?.hemCm ?? 15;
    const fabricWidthCm = input?.fabricWidthCm ?? 140;

    if (!isFiniteNumber(windowWidthCm) || windowWidthCm <= 0) {
      return { ok: false, error: 'windowWidthCm must be a positive number' };
    }
    if (!isFiniteNumber(windowHeightCm) || windowHeightCm <= 0) {
      return { ok: false, error: 'windowHeightCm must be a positive number' };
    }
    if (!isFiniteNumber(fullness) || fullness <= 0) {
      return { ok: false, error: 'fullness must be a positive number' };
    }
    if (!isFiniteNumber(hemCm) || hemCm < 0) {
      return { ok: false, error: 'hemCm must be a non-negative number' };
    }
    if (!isFiniteNumber(fabricWidthCm) || fabricWidthCm <= 0) {
      return { ok: false, error: 'fabricWidthCm must be a positive number' };
    }

    const totalFabricWidthCm = windowWidthCm * fullness;
    const fabricLengthCm = windowHeightCm + hemCm;
    const panels = Math.ceil(totalFabricWidthCm / fabricWidthCm);

    return {
      ok: true,
      data: {
        fabricWidthCm: totalFabricWidthCm,
        fabricLengthCm,
        panels,
      },
      mimeType: 'application/json',
    };
  },
};

export default tool;
