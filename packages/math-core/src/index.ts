/* ===== Re-exports ===== */

export * from './complex';
export * from './errors';
export * from './graph';
export * from './parser';
export * from './solver';
export * from './tokenizer';
export * from './validate';

/* ===== Value types ===== */

import { type Cpx, round } from './complex';
import { evaluateExpr } from './parser';

export interface CalcValue {
  re: number;
  im: number;
  fraction?: { num: number; den: number };
}

/* ===== Private helpers ===== */

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a || 1;
}

function toFraction(x: number): { num: number; den: number } | undefined {
  if (!Number.isFinite(x)) return undefined;
  if (Math.abs(x) < 1e-12) return undefined;
  for (let d = 1; d <= 999; d++) {
    const n = Math.round(x * d);
    if (Math.abs(x * d - n) < 1e-9) {
      if (d === 1) return undefined;
      const g = gcd(n, d);
      return { num: n / g, den: d / g };
    }
  }
  return undefined;
}

/* ===== Public evaluation API ===== */

export function evaluate(expression: string, vars: Record<string, Cpx> = {}): Cpx {
  return evaluateExpr(expression, vars);
}

export function evaluateDetailed(expression: string, vars: Record<string, Cpx> = {}): CalcValue {
  const v = evaluateExpr(expression, vars);
  const result: CalcValue = { re: v.re, im: v.im };
  if (v.im === 0 && Number.isFinite(v.re)) {
    const f = toFraction(v.re);
    if (f) result.fraction = f;
  }
  return result;
}

export function formatCalcValue(v: CalcValue): string {
  if (v.im === 0) {
    if (v.fraction) return `${v.fraction.num}/${v.fraction.den}`;
    return String(round(v.re));
  }
  const r = round(v.re);
  const i = round(v.im);
  if (i === 0) return String(r);
  if (r === 0) return `${i}i`;
  return `${r}${i < 0 ? '-' : '+'}${Math.abs(i)}i`;
}

/* ===== Function evaluators ===== */

import { getEvaluator } from './parser';
import { validateMathExpr } from './validate';

export function evaluateFunction(fnExpr: string, x: number): number {
  validateMathExpr(fnExpr);
  return getEvaluator(fnExpr)(x);
}

export function evaluateAt(fnExpr: string, x: number): number {
  validateMathExpr(fnExpr);
  return getEvaluator(fnExpr)(x);
}

export function slopeAt(fnExpr: string, x: number): number {
  const h = 1e-5;
  const evalFn = getEvaluator(fnExpr);
  const a = evalFn(x - h);
  const b = evalFn(x + h);
  if (!Number.isFinite(a) || !Number.isFinite(b)) return NaN;
  return (b - a) / (2 * h);
}

/* ===== Precision utility ===== */

export function roundTo(value: number, decimals: number): number {
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
}
