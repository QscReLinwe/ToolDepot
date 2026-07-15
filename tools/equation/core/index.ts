import type { EquationResult } from '@tooldepot/math-core';
import { evaluateAt, solveEquation } from '@tooldepot/math-core';
import type { Tool, ToolOutput } from '@tooldepot/types';

export type { EquationResult };

export interface EquationInput {
  equation: string;
}

export { evaluateAt, solveEquation };

/** Allowlist: digits, operators, parentheses, whitespace, x, function names, decimal point, '='. */
function isValidEquation(expr: string): boolean {
  const sides = expr.split('=');
  if (sides.length !== 2) return false;
  const left = sides[0]!.trim();
  const right = sides[1]!.trim();

  // Validate both sides using the same logic
  const validateSide = (side: string): boolean => {
    let s = side.replace(/(sin|cos|tan|asin|acos|atan|sqrt|abs|log|ln|exp|PI|E)/gi, ' ');
    s = s.replace(/\bx\b/gi, ' ');
    return /^[0-9+\-*/^%().\s]+$/.test(s);
  };

  return validateSide(left) && validateSide(right);
}

export const tool: Tool<EquationInput, EquationResult> = {
  id: 'equation-solver',
  name: '方程求解',
  description: '使用二分法求解方程 f(x)=g(x)，支持线性、二次、三角方程，并提供函数图像与交点可视化',
  category: 'developer',
  async run(input): Promise<ToolOutput<EquationResult>> {
    const equation = typeof input?.equation === 'string' ? input.equation : '';
    if (equation.trim() === '') return { ok: false, error: '请输入方程' };
    if (!isValidEquation(equation)) {
      return { ok: false, error: 'Expression contains invalid characters' };
    }
    try {
      const result = solveEquation(equation);
      return { ok: true, data: result, mimeType: 'application/json' };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : '错误' };
    }
  },
};

export default tool;
