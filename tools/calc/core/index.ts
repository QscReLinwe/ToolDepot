import type { CalcValue, Cpx, EquationResult } from '@tooldepot/math-core';
import {
  cpx,
  evaluate,
  evaluateDetailed,
  evaluateFunction,
  formatCalcValue,
  solveEquation,
} from '@tooldepot/math-core';
import type { Tool, ToolOutput } from '@tooldepot/types';

export type { CalcValue, Cpx, EquationResult };

export interface CalcInput {
  expression: string;
  vars?: Record<string, number>;
}

export interface CalcResult {
  result: string;
  value?: CalcValue;
}

export { cpx, evaluate, evaluateDetailed, evaluateFunction, formatCalcValue, solveEquation };

export const tool: Tool<CalcInput, CalcResult> = {
  id: 'calc',
  name: '计算器',
  description:
    '高级计算器：支持变量赋值 a=1、+ - * / ( ) % ^、虚数 i、绝对值 |x|、阶乘 !、求和 Σ、求积 ∏、分数、三角函数与常量 π/e/i',
  category: 'utility',
  async run(input): Promise<ToolOutput<CalcResult>> {
    const expression = typeof input?.expression === 'string' ? input.expression : '';
    if (expression.trim() === '') return { ok: false, error: '请输入表达式' };
    try {
      const varsMap: Record<string, Cpx> = {};
      for (const [k, v] of Object.entries(input.vars ?? {})) varsMap[k] = cpx(v);
      const value = evaluateDetailed(expression, varsMap);
      if (!Number.isFinite(value.re) || !Number.isFinite(value.im)) {
        return { ok: false, error: '计算结果无效' };
      }
      return { ok: true, data: { result: formatCalcValue(value), value }, mimeType: 'text/plain' };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : '错误' };
    }
  },
};

export default tool;
