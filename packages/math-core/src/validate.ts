import { CalcError } from './errors';

/* ===== Expression validation (injection guard) ===== */

export function validateMathExpr(expr: string): void {
  if (typeof expr !== 'string') {
    throw new CalcError('表达式包含无效字符');
  }
  let s = expr.replace(/(sin|cos|tan|asin|acos|atan|sqrt|abs|log|ln|exp|PI|E)/gi, ' ');
  s = s.replace(/\b(x)\b/gi, ' ');
  if (/[^0-9.+\-*/^%()\s]/.test(s)) {
    throw new CalcError('表达式包含无效字符');
  }
  let depth = 0;
  for (const ch of expr) {
    if (ch === '(') depth++;
    else if (ch === ')') {
      depth--;
      if (depth < 0) break;
    }
  }
  if (depth !== 0) {
    throw new CalcError('表达式包含无效字符');
  }
}
