import { getEvaluator } from './parser';
import { validateMathExpr } from './validate';

/* ===== Equation types ===== */

export interface EquationResult {
  x: number;
  iterations: number;
  error: number;
}

/* ===== Equation solvers ===== */

function fFromEquation(equation: string): (x: number) => number {
  const sides = equation.split('=');
  if (sides.length !== 2) throw new Error('方程必须包含一个 =');
  const left = sides[0]!.trim();
  const right = sides[1]!.trim();

  validateMathExpr(left);
  validateMathExpr(right);

  return (x: number) => getEvaluator(left)(x) - getEvaluator(right)(x);
}

export function solveBisection(equation: string): EquationResult {
  const f = fFromEquation(equation);

  let low = -1e6,
    high = 1e6;
  let fLow: number | undefined, fHigh: number | undefined;

  for (let range = 1; range <= 1e6; range *= 10) {
    const pairs: [number, number][] = [
      [-range, range],
      [-range * 10, range * 10],
    ];
    for (const [a, b] of pairs) {
      const fa = f(a);
      const fb = f(b);
      if (fa * fb < 0 || fa === 0 || fb === 0) {
        low = a;
        high = b;
        fLow = fa;
        fHigh = fb;
        break;
      }
    }
    if (fLow !== undefined) break;
  }

  if (fLow === undefined) {
    const f0 = f(0);
    if (Math.abs(f0) < 1e-10) return { x: 0, iterations: 0, error: Math.abs(f0) };
    throw new Error('找不到解——未检测到符号变化');
  }

  if (fLow === 0) return { x: low, iterations: 0, error: 0 };
  if (fHigh === 0) return { x: high, iterations: 0, error: 0 };

  let iter = 0;
  const maxIter = 200;
  let mid = 0;
  while (iter < maxIter) {
    mid = (low + high) / 2;
    const fMid = f(mid);
    if (Math.abs(fMid) < 1e-14 || high - low < 1e-14) {
      return { x: mid, iterations: iter, error: Math.abs(fMid) };
    }
    if (fLow * fMid < 0) {
      high = mid;
      fHigh = fMid;
    } else {
      low = mid;
      fLow = fMid;
    }
    iter++;
  }
  return { x: mid, iterations: iter, error: Math.abs(f(mid)) };
}

export function solveEquation(equation: string): EquationResult {
  return solveBisection(equation);
}

export function solveNewton(equation: string, guess = 0, maxIter = 100, tol = 1e-12): EquationResult {
  const f = fFromEquation(equation);
  const df = (x: number) => {
    const h = 1e-6;
    return (f(x + h) - f(x - h)) / (2 * h);
  };
  let x = guess;
  let iter = 0;
  let error = Math.abs(f(x));

  if (error < tol) return { x, iterations: 0, error };

  while (iter < maxIter) {
    const deriv = df(x);

    if (Math.abs(deriv) < 1e-14) {
      const h = 1e-4;
      const deriv2 = (f(x + h) - f(x - h)) / (2 * h);
      if (Math.abs(deriv2) < 1e-14) {
        break;
      }
      x = x - f(x) / deriv2;
    } else {
      const next = x - f(x) / deriv;
      const maxStep = Math.max(1, Math.abs(x) * 10);
      const step = next - x;
      if (Math.abs(step) > maxStep) {
        x = x + (step > 0 ? maxStep : -maxStep);
      } else {
        x = next;
      }
    }

    error = Math.abs(f(x));
    if (error < tol) {
      iter++;
      break;
    }
    iter++;
  }

  return { x, iterations: iter, error };
}
