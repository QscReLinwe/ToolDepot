import { evaluateFunction, slopeAt } from '@tooldepot/math-core';
import type { Tool, ToolOutput } from '@tooldepot/types';

export interface GraphInput {
  /** Function expression in x, e.g. "sin(x)", "x^2", "2*x+1". */
  expression: string;
  /** Optional x value to evaluate at (defaults to 0). */
  x?: number;
}

export interface GraphResult {
  /** f(x) at the requested x. */
  value: number;
  /** Derivative f'(x) via central difference (NaN if undefined). */
  slope: number;
}

export { evaluateFunction, slopeAt };

/** Allowlist: digits, operators, parentheses, whitespace, x, function names, decimal point. */
function isValidExpression(expr: string): boolean {
  // Strip allowed function names and 'x', verify only safe chars remain
  let s = expr.replace(/(sin|cos|tan|asin|acos|atan|sqrt|abs|log|ln|exp|PI|E)/gi, ' ');
  s = s.replace(/\bx\b/gi, ' ');
  return /^[0-9+\-*/^%().\s]+$/.test(s);
}

export const tool: Tool<GraphInput, GraphResult> = {
  id: 'function-graph',
  name: '函数图像',
  description: '输入函数表达式绘制二维图像, 支持拖拽平移、滚轮缩放与悬停查看函数值和斜率',
  category: 'developer',
  async run(input): Promise<ToolOutput<GraphResult>> {
    const expression = typeof input?.expression === 'string' ? input.expression : '';
    if (expression.trim() === '') return { ok: false, error: '请输入函数表达式' };
    if (!isValidExpression(expression)) {
      return { ok: false, error: 'Expression contains invalid characters' };
    }
    const x = typeof input?.x === 'number' && Number.isFinite(input.x) ? input.x : 0;
    try {
      const value = evaluateFunction(expression, x);
      if (!Number.isFinite(value)) {
        return { ok: false, error: '函数在该点无定义或表达式无效' };
      }
      const slope = slopeAt(expression, x);
      return {
        ok: true,
        data: { value, slope: Number.isFinite(slope) ? slope : NaN },
        mimeType: 'application/json',
      };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : '表达式无效' };
    }
  },
};

export default tool;
