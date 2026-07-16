import type { Tool, ToolOutput } from '@tooldepot/types';

export type PaintFloorMode = 'paint' | 'floor';

export interface PaintFloorInput {
  mode: PaintFloorMode;
  areaSqm?: number;
  lengthM?: number;
  widthM?: number;
  coats?: number;
  /** Paint coverage in liters per square meter (default 10). */
  coveragePerL?: number;
  /** Floor area covered by one box in square meters (default 2.0). */
  floorBoxSqm?: number;
  /** Waste allowance as a percentage (default 10). */
  wastePercent?: number;
}

export interface PaintFloorOutput {
  areaSqm: number;
  paintLiters?: number;
  floorBoxes?: number;
  /** The relevant quantity (paint liters or floor boxes) including waste. */
  withWaste: number;
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

export const tool: Tool<PaintFloorInput, PaintFloorOutput> = {
  id: 'paint-floor',
  name: '墙漆 / 地板用量计算',
  description: '计算涂刷面积所需油漆升数与地板箱数（含损耗）。',
  category: 'home',
  async run(input: PaintFloorInput): Promise<ToolOutput<PaintFloorOutput>> {
    const mode = input?.mode;
    if (mode !== 'paint' && mode !== 'floor') {
      return { ok: false, error: "mode must be 'paint' or 'floor'" };
    }

    const wastePercent = input?.wastePercent ?? 10;
    if (!isFiniteNumber(wastePercent) || wastePercent < 0) {
      return { ok: false, error: 'wastePercent must be a non-negative number' };
    }

    // Resolve area: explicit areaSqm, or lengthM * widthM.
    let areaSqm = input?.areaSqm;
    if (!isFiniteNumber(areaSqm)) {
      const lengthM = input?.lengthM;
      const widthM = input?.widthM;
      if (!isFiniteNumber(lengthM) || !isFiniteNumber(widthM)) {
        return { ok: false, error: 'Provide areaSqm, or both lengthM and widthM' };
      }
      if (lengthM <= 0 || widthM <= 0) {
        return { ok: false, error: 'lengthM and widthM must be positive' };
      }
      areaSqm = lengthM * widthM;
    }
    if (areaSqm <= 0) {
      return { ok: false, error: 'areaSqm must be positive' };
    }

    const wasteFactor = 1 + wastePercent / 100;

    if (mode === 'paint') {
      const coats = input?.coats ?? 1;
      const coveragePerL = input?.coveragePerL ?? 10;
      if (!isFiniteNumber(coats) || coats <= 0) {
        return { ok: false, error: 'coats must be a positive number' };
      }
      if (!isFiniteNumber(coveragePerL) || coveragePerL <= 0) {
        return { ok: false, error: 'coveragePerL must be a positive number' };
      }
      const paintLiters = (areaSqm * coats) / coveragePerL;
      return {
        ok: true,
        data: {
          areaSqm,
          paintLiters,
          withWaste: paintLiters * wasteFactor,
        },
        mimeType: 'application/json',
      };
    }

    // floor mode
    const floorBoxSqm = input?.floorBoxSqm ?? 2.0;
    if (!isFiniteNumber(floorBoxSqm) || floorBoxSqm <= 0) {
      return { ok: false, error: 'floorBoxSqm must be a positive number' };
    }
    const floorBoxes = Math.ceil(areaSqm / floorBoxSqm);
    return {
      ok: true,
      data: {
        areaSqm,
        floorBoxes,
        withWaste: Math.ceil((areaSqm * wasteFactor) / floorBoxSqm),
      },
      mimeType: 'application/json',
    };
  },
};

export default tool;
