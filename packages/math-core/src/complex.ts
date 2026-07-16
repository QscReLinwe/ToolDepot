import { CalcError } from './errors';

export type { CalcError } from './errors';

/* ===== Complex numbers ===== */

export interface Cpx {
  re: number;
  im: number;
}

export const cpx = (re: number, im = 0): Cpx => ({ re, im });
export const cAdd = (a: Cpx, b: Cpx): Cpx => ({ re: a.re + b.re, im: a.im + b.im });
export const cSub = (a: Cpx, b: Cpx): Cpx => ({ re: a.re - b.re, im: a.im - b.im });
export const cMul = (a: Cpx, b: Cpx): Cpx => ({
  re: a.re * b.re - a.im * b.im,
  im: a.re * b.im + a.im * b.re,
});
export const cDiv = (a: Cpx, b: Cpx): Cpx => {
  const d = b.re * b.re + b.im * b.im;
  if (d === 0) throw new CalcError('除以零');
  return { re: (a.re * b.re + a.im * b.im) / d, im: (a.im * b.re - a.re * b.im) / d };
};
export const cNeg = (a: Cpx): Cpx => ({ re: -a.re, im: -a.im === 0 ? 0 : -a.im });
export const cAbs = (a: Cpx): number => Math.hypot(a.re, a.im);

export const cLn = (z: Cpx): Cpx => ({ re: Math.log(cAbs(z)), im: Math.atan2(z.im, z.re) });
export const cExp = (z: Cpx): Cpx => {
  const e = Math.exp(z.re);
  return { re: e * Math.cos(z.im), im: e * Math.sin(z.im) };
};
export const cSqrt = (z: Cpx): Cpx => cPow(z, cpx(0.5));
export const cPow = (z: Cpx, w: Cpx): Cpx => {
  if (w.im === 0 && Number.isInteger(w.re)) {
    const n = w.re;
    let res = cpx(1);
    if (n >= 0) {
      for (let i = 0; i < n; i++) res = cMul(res, z);
    } else {
      for (let i = 0; i < -n; i++) res = cMul(res, z);
      res = cDiv(cpx(1), res);
    }
    return res;
  }
  const dbg = cExp(cMul(w, cLn(z)));
  if (!Number.isFinite(dbg.re) || !Number.isFinite(dbg.im)) {
    throw new CalcError(`cPow 产生非有限结果 (z=${JSON.stringify(z)}, w=${JSON.stringify(w)})`);
  }
  return dbg;
};

export const cSin = (z: Cpx): Cpx => ({
  re: Math.sin(z.re) * Math.cosh(z.im),
  im: Math.cos(z.re) * Math.sinh(z.im),
});
export const cCos = (z: Cpx): Cpx => ({
  re: Math.cos(z.re) * Math.cosh(z.im),
  im: -Math.sin(z.re) * Math.sinh(z.im),
});
export const cTan = (z: Cpx): Cpx => cDiv(cSin(z), cCos(z));
export const cAsin = (z: Cpx): Cpx => {
  const i = cpx(0, 1);
  const root = cSqrt(cSub(cpx(1), cMul(z, z)));
  return cMul(cpx(0, -1), cLn(cAdd(cMul(i, z), root)));
};
export const cAcos = (z: Cpx): Cpx => cSub(cpx(Math.PI / 2), cAsin(z));
export const cAtan = (z: Cpx): Cpx => {
  const i = cpx(0, 1);
  return cMul(cpx(0, -0.5), cSub(cLn(cAdd(cpx(1), cMul(i, z))), cLn(cSub(cpx(1), cMul(i, z)))));
};
export const cFactorial = (z: Cpx): Cpx => {
  if (z.im !== 0) throw new CalcError('虚数不能阶乘');
  const n = z.re;
  if (!Number.isInteger(n)) throw new CalcError('阶乘仅支持整数');
  if (n < 0) throw new CalcError('负数不能阶乘');
  if (n > 170) throw new CalcError('数值过大 (最大 170)');
  if (n <= 21) {
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return cpx(r);
  }
  // Use BigInt for n > 21 to avoid precision loss
  let r = 1n;
  for (let i = 2n; i <= BigInt(n); i++) r *= i;
  return cpx(Number(r));
};

export const toRad = (z: Cpx): Cpx => cMul(z, cpx(Math.PI / 180));
export const toDeg = (z: Cpx): Cpx => cMul(z, cpx(180 / Math.PI));

export function round(x: number): number {
  return Math.round(x * 1e10) / 1e10;
}
