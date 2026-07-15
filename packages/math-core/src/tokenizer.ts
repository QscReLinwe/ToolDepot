import { type Cpx, cpx } from './complex';
import { CalcError } from './errors';

export type TokenType =
  | 'NUMBER'
  | 'PLUS'
  | 'MINUS'
  | 'MUL'
  | 'DIV'
  | 'PERCENT'
  | 'LPAREN'
  | 'RPAREN'
  | 'ABS'
  | 'FACT'
  | 'COMMA'
  | 'POW'
  | 'FUNC'
  | 'VAR'
  | 'EOF';

export interface Token {
  type: TokenType;
  value: number | string | Cpx;
  start: number;
  end: number;
}

export const FUNCS = new Set([
  'sin',
  'cos',
  'tan',
  'asin',
  'acos',
  'atan',
  'sind',
  'cosd',
  'tand',
  'asind',
  'acosd',
  'atand',
  'abs',
  'sqrt',
  'ln',
  'log',
  'exp',
  'sum',
  'prod',
]);

export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const n = input.length;
  const push = (type: TokenType, value: number | string | Cpx, start: number, end: number) =>
    tokens.push({ type, value, start, end });

  let prevValue = false;

  while (i < n) {
    const ch = input[i]!;

    // Check for implicit multiplication: prevValue followed by factor start without operator
    if (prevValue && /[0-9.(a-zA-Zα-ωΑ-Ω]/.test(ch)) {
      const lookAheadIsFactorStart =
        (ch >= '0' && ch <= '9') ||
        ch === '.' ||
        ch === '(' ||
        /[a-zA-Zα-ωΑ-Ω]/.test(ch) ||
        ch === 'π' ||
        ch === 'Σ' ||
        ch === '∏';

      if (lookAheadIsFactorStart) {
        push('MUL', '', i, i);
        prevValue = false;
      }
    }

    if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') {
      i++;
      continue;
    }
    if (ch === '+') {
      push('PLUS', '', i, i);
      prevValue = false;
      i++;
      continue;
    }
    if (ch === '-') {
      push('MINUS', '', i, i);
      prevValue = false;
      i++;
      continue;
    }
    if (ch === '*') {
      push('MUL', '', i, i);
      prevValue = false;
      i++;
      continue;
    }
    if (ch === '/') {
      push('DIV', '', i, i);
      prevValue = false;
      i++;
      continue;
    }
    if (ch === '^') {
      push('POW', '', i, i);
      prevValue = false;
      i++;
      continue;
    }
    if (ch === '%') {
      push('PERCENT', '', i, i);
      prevValue = false;
      i++;
      continue;
    }
    if (ch === '(') {
      push('LPAREN', '', i, i);
      prevValue = false;
      i++;
      continue;
    }
    if (ch === ')') {
      push('RPAREN', '', i, i);
      prevValue = true;
      i++;
      continue;
    }
    if (ch === '|') {
      push('ABS', '', i, i);
      prevValue = false;
      i++;
      continue;
    }
    if (ch === '!') {
      push('FACT', '', i, i);
      prevValue = false;
      i++;
      continue;
    }
    if (ch === ',') {
      push('COMMA', '', i, i);
      prevValue = false;
      i++;
      continue;
    }
    if (ch === 'π') {
      push('NUMBER', cpx(Math.PI), i, i);
      i++;
      continue;
    }
    if (ch === 'Σ') {
      push('FUNC', 'sum', i, i);
      i++;
      continue;
    }
    if (ch === '∏') {
      push('FUNC', 'prod', i, i);
      i++;
      continue;
    }
    if (/[a-zA-Zα-ωΑ-Ω]/.test(ch)) {
      const start = i;
      let word = '';
      while (i < n && /[a-zA-Zα-ωΑ-Ω]/.test(input[i]!)) {
        word += input[i];
        i++;
      }
      const low = word.toLowerCase();
      if (low === 'pi') {
        push('NUMBER', cpx(Math.PI), start, i - 1);
        continue;
      }
      if (low === 'e') {
        push('NUMBER', cpx(Math.E), start, i - 1);
        continue;
      }
      if (low === 'i') {
        push('NUMBER', cpx(0, 1), start, i - 1);
        prevValue = true;
        continue;
      }
      if (FUNCS.has(low)) {
        push('FUNC', low, start, i - 1);
        prevValue = false;
        continue;
      }
      push('VAR', low, start, i - 1);
      prevValue = true;
      continue;
    }
    if (ch === '.' || (ch >= '0' && ch <= '9')) {
      const start = i;
      let num = '';
      while (i < n && ((input[i]! >= '0' && input[i]! <= '9') || input[i]! === '.')) {
        num += input[i];
        i++;
      }
      if ((num.match(/\./g) || []).length > 1) throw new CalcError('无效数字');
      const val = Number(num);
      if (Number.isNaN(val)) throw new CalcError('无效数字');
      push('NUMBER', cpx(val), start, i - 1);
      prevValue = true;
      continue;
    }
    throw new CalcError(`无效字符: ${ch}`);
  }
  push('EOF', '', n, n);
  return tokens;
}
