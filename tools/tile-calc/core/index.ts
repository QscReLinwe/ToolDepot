import type { Tool, ToolOutput } from '@tooldepot/types';

export interface TileCalcInput {
  areaSqm?: number;
  tileLengthCm?: number;
  tileWidthCm?: number;
  /** Grout line width in mm (added to each tile's footprint). */
  groutMm?: number;
  /** Waste allowance as a percentage (default 10). */
  wastePercent?: number;
  /** Tiles per box (optional — enables box count output). */
  boxSize?: number;
}

export interface TileCalcOutput {
  areaSqm: number;
  /** Effective area of one tile including grout, in m². */
  tileAreaSqm: number;
  tilesNeeded: number;
  tilesWithWaste: number;
  boxes?: number;
  boxSize?: number;
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

export const tool: Tool<TileCalcInput, TileCalcOutput> = {
  id: 'tile-calc',
  name: '瓷砖 / 地板铺贴计算',
  description: '计算覆盖面积所需瓷砖与箱数（含填缝与损耗）。',
  category: 'home',
  async run(input: TileCalcInput): Promise<ToolOutput<TileCalcOutput>> {
    const areaSqm = input?.areaSqm;
    const tileLengthCm = input?.tileLengthCm;
    const tileWidthCm = input?.tileWidthCm;
    const groutMm = input?.groutMm ?? 0;
    const wastePercent = input?.wastePercent ?? 10;

    if (!isFiniteNumber(areaSqm) || areaSqm <= 0) {
      return { ok: false, error: 'areaSqm must be a positive number' };
    }
    if (!isFiniteNumber(tileLengthCm) || tileLengthCm <= 0) {
      return { ok: false, error: 'tileLengthCm must be a positive number' };
    }
    if (!isFiniteNumber(tileWidthCm) || tileWidthCm <= 0) {
      return { ok: false, error: 'tileWidthCm must be a positive number' };
    }
    if (!isFiniteNumber(groutMm) || groutMm < 0) {
      return { ok: false, error: 'groutMm must be a non-negative number' };
    }
    if (!isFiniteNumber(wastePercent) || wastePercent < 0) {
      return { ok: false, error: 'wastePercent must be a non-negative number' };
    }

    // Effective footprint of one tile including grout lines (cm → m).
    const tileAreaSqm = ((tileLengthCm + groutMm) / 100) * ((tileWidthCm + groutMm) / 100);
    const tilesNeeded = Math.ceil(areaSqm / tileAreaSqm);
    const tilesWithWaste = Math.ceil(tilesNeeded * (1 + wastePercent / 100));

    const boxSize = input?.boxSize;
    const data: TileCalcOutput = {
      areaSqm,
      tileAreaSqm,
      tilesNeeded,
      tilesWithWaste,
    };

    if (isFiniteNumber(boxSize) && boxSize > 0) {
      data.boxSize = boxSize;
      data.boxes = Math.ceil(tilesWithWaste / boxSize);
    }

    return { ok: true, data, mimeType: 'application/json' };
  },
};

export default tool;
