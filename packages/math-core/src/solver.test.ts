import { describe, expect, it } from 'vitest';
import { CalcError } from './errors';
import { solveNewton } from './solver';

describe('solver: solveNewton', () => {
  it('solves a normal equation (x^2=4)', () => {
    const r = solveNewton('x^2=4', 1);
    expect(Math.abs(r.x - 2)).toBeLessThan(1e-6);
    expect(r.error).toBeLessThan(1e-6);
  });

  it('solves a linear equation (2x+3=7)', () => {
    const r = solveNewton('2*x+3=7', 0);
    expect(Math.abs(r.x - 2)).toBeLessThan(1e-6);
  });

  it('throws CalcError in a flat region (no real root)', () => {
    expect(() => solveNewton('x^2+1=0', 0)).toThrow(CalcError);
  });
});
