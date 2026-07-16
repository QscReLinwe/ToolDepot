import { describe, expect, it } from 'vitest';
import { cAdd, cAtan, cMul, cPow, cpx } from './complex';
import { CalcError } from './errors';

const close = (a: number, b: number, eps = 1e-4) => Math.abs(a - b) < eps;

describe('complex: cAdd / cMul', () => {
  it('cAdd adds real and imaginary parts', () => {
    expect(cAdd(cpx(1, 2), cpx(3, 4))).toEqual({ re: 4, im: 6 });
  });

  it('cMul multiplies complex numbers', () => {
    const r = cMul(cpx(1, 2), cpx(3, 4));
    expect(close(r.re, -5)).toBe(true);
    expect(close(r.im, 10)).toBe(true);
  });
});

describe('complex: cAtan', () => {
  it('atan(1) ~ 0.7854', () => {
    const r = cAtan(cpx(1));
    expect(close(r.re, 0.7854)).toBe(true);
    expect(close(r.im, 0)).toBe(true);
  });

  it('atan(2i) ~ (1.5708, 0.5493)', () => {
    const r = cAtan(cpx(0, 2));
    expect(close(r.re, 1.5708)).toBe(true);
    expect(close(r.im, 0.5493)).toBe(true);
  });
});

describe('complex: cPow', () => {
  it('throws CalcError when result is non-finite (NaN base, fractional exponent)', () => {
    expect(() => cPow(cpx(NaN, 0), cpx(0.5))).toThrow(CalcError);
  });

  it('throws CalcError for non-finite imaginary result', () => {
    expect(() => cPow(cpx(0, NaN), cpx(0.5))).toThrow(CalcError);
  });
});
