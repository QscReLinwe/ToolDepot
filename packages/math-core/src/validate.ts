import type { Cpx } from './complex';
import { CalcError } from './errors';
import { evaluateExpr } from './parser';

/* ===== Expression validation (injection guard) ===== */

// Characters the tokenizer accepts: digits, dot, operators, parens, abs/factorial/comma,
// the special symbols π/Σ/∏/i, and any ASCII/Greek letter (functions, vars, constants).
const ALLOWED_CHAR = /[0-9.+\-*/^%()|!,πΣ∏i a-zA-Zα-ωΑ-Ω]/;

export function validateMathExpr(expr: string, vars: Record<string, Cpx> = {}): void {
  if (typeof expr !== 'string') {
    throw new CalcError('表达式包含无效字符');
  }
  if (!ALLOWED_CHAR.test(expr)) {
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
  // Ensure the expression actually parses (e.g. reject "1 2 3").
  // Known variables (e.g. "x" in equations / function bodies) must be supplied
  // so they are not mistaken for unknown identifiers.
  try {
    evaluateExpr(expr, vars);
  } catch {
    throw new CalcError('表达式包含无效字符');
  }
}
