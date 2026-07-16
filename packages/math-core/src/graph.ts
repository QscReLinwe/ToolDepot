import { CalcError } from './errors';
import { getEvaluator } from './parser';

/* ===== Graphing ===== */

export interface GraphRange {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  points: { x: number; y: number }[];
}

export function getDefaultRange(fnExpr: string, xMin = -10, xMax = 10, samples = 200): GraphRange {
  const points: { x: number; y: number }[] = [];
  let yMin = Infinity;
  let yMax = -Infinity;
  const evalFn = getEvaluator(fnExpr);
  for (let i = 0; i <= samples; i++) {
    const x = xMin + (xMax - xMin) * (i / samples);
    const y = evalFn(x);
    if (Number.isFinite(y)) {
      points.push({ x, y });
      if (y < yMin) yMin = y;
      if (y > yMax) yMax = y;
    }
  }
  return {
    xMin,
    xMax,
    yMin: Number.isFinite(yMin) ? yMin : -10,
    yMax: Number.isFinite(yMax) ? yMax : 10,
    points,
  };
}

export function graphRange(fnExpr: string, xMin?: number, xMax?: number, samples?: number): GraphRange {
  return getDefaultRange(fnExpr, xMin ?? -10, xMax ?? 10, samples ?? 200);
}

export interface CoordinateTransform {
  toPixelX(x: number): number;
  toPixelY(y: number): number;
  toDataX(px: number): number;
  toDataY(py: number): number;
}

export function renderCoordinates(opts: {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  width: number;
  height: number;
  padding?: number;
}): CoordinateTransform {
  const pad = opts.padding ?? 0;
  const w = opts.width - pad * 2;
  const h = opts.height - pad * 2;
  if (opts.xMax <= opts.xMin) {
    throw new CalcError('xMax must be greater than xMin');
  }
  if (opts.yMax <= opts.yMin) {
    throw new CalcError('yMax must be greater than yMin');
  }
  const sx = w / (opts.xMax - opts.xMin);
  const sy = h / (opts.yMax - opts.yMin);
  return {
    toPixelX: (x) => pad + (x - opts.xMin) * sx,
    toPixelY: (y) => pad + (opts.yMax - y) * sy,
    toDataX: (px) => opts.xMin + (px - pad) / sx,
    toDataY: (py) => opts.yMax - (py - pad) / sy,
  };
}
