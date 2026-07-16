import { describe, expect, it } from 'vitest';
import { CalcError } from './errors';
import { evaluate } from './index';
import { validateMathExpr } from './validate';

describe('evaluate: complex value', () => {
  it('returns full Cpx including .im for complex results', () => {
    const v = evaluate('sqrt(-1)');
    expect(v.re).toBeCloseTo(0);
    expect(v.im).toBe(1);
  });

  it('returns real-only result with im = 0', () => {
    const v = evaluate('2 + 3');
    expect(v).toEqual({ re: 5, im: 0 });
  });
});

describe('validateMathExpr: rejection', () => {
  it('rejects illegal characters', () => {
    expect(() => validateMathExpr('1 + 2 @')).toThrow(CalcError);
  });

  it('rejects unbalanced parentheses', () => {
    expect(() => validateMathExpr('(1 + 2')).toThrow(CalcError);
  });

  it('accepts a valid expression without free variables', () => {
    expect(() => validateMathExpr('sin(1) + 2*3')).not.toThrow();
  });
});
