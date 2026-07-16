import { describe, expect, it } from 'vitest';
import { CalcError } from './errors';
import { getDefaultRange, renderCoordinates } from './graph';

describe('graph: getDefaultRange', () => {
  it('produces a valid range for a normal function', () => {
    const r = getDefaultRange('x^2', -2, 2, 10);
    expect(r.xMin).toBe(-2);
    expect(r.xMax).toBe(2);
    expect(r.points.length).toBeGreaterThan(0);
  });

  it('throws CalcError when xMax <= xMin (degenerate range)', () => {
    expect(() => getDefaultRange('x', 10, 5)).toThrow(CalcError);
    expect(() => getDefaultRange('x', 3, 3)).toThrow(CalcError);
  });

  it('throws CalcError when bounds are NaN', () => {
    expect(() => getDefaultRange('x', NaN, 5)).toThrow(CalcError);
    expect(() => getDefaultRange('x', 0, NaN)).toThrow(CalcError);
  });
});

describe('graph: renderCoordinates', () => {
  it('throws CalcError on degenerate x range', () => {
    expect(() => renderCoordinates({ xMin: 5, xMax: 5, yMin: 0, yMax: 10, width: 100, height: 100 })).toThrow(
      CalcError,
    );
  });

  it('throws CalcError on degenerate y range', () => {
    expect(() => renderCoordinates({ xMin: 0, xMax: 10, yMin: 10, yMax: 10, width: 100, height: 100 })).toThrow(
      CalcError,
    );
  });

  it('builds a working coordinate transform for a valid range', () => {
    const t = renderCoordinates({ xMin: 0, xMax: 10, yMin: 0, yMax: 10, width: 100, height: 100 });
    expect(t.toPixelX(0)).toBeCloseTo(0);
    expect(t.toPixelX(10)).toBeCloseTo(100);
  });
});
