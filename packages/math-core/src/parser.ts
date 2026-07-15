import {
  type Cpx,
  cAbs,
  cAcos,
  cAdd,
  cAsin,
  cAtan,
  cCos,
  cDiv,
  cExp,
  cFactorial,
  cLn,
  cMul,
  cNeg,
  cPow,
  cpx,
  cSin,
  cSqrt,
  cSub,
  cTan,
  toDeg,
  toRad,
} from './complex';
import { CalcError } from './errors';
import { type Token, tokenize } from './tokenizer';

/* ===== Internal types ===== */

interface Arg {
  val: Cpx;
  start: number;
  end: number;
}

/* ===== Parser ===== */

export class Parser {
  private tokens: Token[];
  private pos = 0;
  private input: string;
  private vars: Record<string, Cpx>;

  constructor(tokens: Token[], input: string, vars: Record<string, Cpx>) {
    this.tokens = tokens;
    this.input = input;
    this.vars = vars;
  }

  private peek(): Token {
    return (
      this.tokens[this.pos] ??
      (() => {
        throw new CalcError('意外结束');
      })()
    );
  }
  private next(): Token {
    return (
      this.tokens[this.pos++] ??
      (() => {
        throw new CalcError('意外结束');
      })()
    );
  }

  parse(): Cpx {
    const v = this.expression();
    if (this.peek().type !== 'EOF') throw new CalcError('无效表达式');
    return v;
  }

  private expression(): Cpx {
    let value = this.term();
    while (this.peek().type === 'PLUS' || this.peek().type === 'MINUS') {
      const op = this.next().type;
      const rhs = this.term();
      value = op === 'PLUS' ? cAdd(value, rhs) : cSub(value, rhs);
    }
    return value;
  }

  private term(): Cpx {
    let value = this.factor();
    while (this.peek().type === 'MUL' || this.peek().type === 'DIV') {
      const op = this.next().type;
      const rhs = this.factor();
      value = op === 'MUL' ? cMul(value, rhs) : cDiv(value, rhs);
    }
    return value;
  }

  private factor(): Cpx {
    let value = this.postfix();
    while (this.peek().type === 'POW') {
      this.next();
      const rhs = this.postfix();
      value = cPow(value, rhs);
    }
    return value;
  }

  private postfix(): Cpx {
    let value = this.primary();
    while (this.peek().type === 'FACT') {
      this.next();
      value = cFactorial(value);
    }
    if (this.peek().type === 'PERCENT') {
      this.next();
      value = cMul(value, cpx(0.01));
    }
    return value;
  }

  private primary(): Cpx {
    const tok = this.peek();
    if (tok.type === 'MINUS') {
      this.next();
      return cNeg(this.postfix());
    }
    if (tok.type === 'PLUS') {
      this.next();
      return this.postfix();
    }
    if (tok.type === 'NUMBER') {
      this.next();
      return tok.value as Cpx;
    }
    if (tok.type === 'VAR') {
      this.next();
      const name = tok.value as string;
      const v = this.vars[name];
      if (!v) throw new CalcError(`未知变量: ${name}`);
      return v;
    }
    if (tok.type === 'FUNC') {
      return this.call(tok.value as string);
    }
    if (tok.type === 'ABS') {
      this.next();
      const v = this.expression();
      if (this.peek().type !== 'ABS') throw new CalcError('缺少 |');
      this.next();
      return cpx(cAbs(v), 0);
    }
    if (tok.type === 'LPAREN') {
      this.next();
      const v = this.expression();
      if (this.peek().type !== 'RPAREN') throw new CalcError('缺少 )');
      this.next();
      return v;
    }
    throw new CalcError('无效表达式');
  }

  private call(name: string): Cpx {
    this.next();
    if (this.peek().type !== 'LPAREN') throw new CalcError(`函数 ${name} 需要参数`);
    this.next();
    const args: Arg[] = [];
    if (this.peek().type !== 'RPAREN') {
      while (true) {
        const startPos = this.pos;
        const val = this.expression();
        const endPos = this.pos - 1;
        args.push({ val, start: startPos, end: endPos });
        if (this.peek().type === 'COMMA') {
          this.next();
          continue;
        }
        break;
      }
    }
    if (this.peek().type !== 'RPAREN') throw new CalcError('缺少 )');
    this.next();
    return this.applyFunc(name, args);
  }

  private applyFunc(name: string, args: Arg[]): Cpx {
    const need = (count: number) => {
      if (args.length !== count) throw new CalcError(`函数 ${name} 需要 ${count} 个参数`);
    };
    switch (name) {
      case 'sin':
      case 'cos':
      case 'tan':
      case 'asin':
      case 'acos':
      case 'atan':
        need(1);
        return trig(name, args[0]!.val, false);
      case 'sind':
      case 'cosd':
      case 'tand':
      case 'asind':
      case 'acosd':
      case 'atand':
        need(1);
        return trig(name, args[0]!.val, true);
      case 'abs':
        need(1);
        return cpx(cAbs(args[0]!.val), 0);
      case 'sqrt':
        need(1);
        return cSqrt(args[0]!.val);
      case 'ln':
        need(1);
        return cLn(args[0]!.val);
      case 'log':
        need(1);
        return cDiv(cLn(args[0]!.val), cpx(Math.LN10));
      case 'exp':
        need(1);
        return cExp(args[0]!.val);
      case 'sum':
      case 'prod': {
        need(3);
        const start = args[0]!.val;
        const end = args[1]!.val;
        if (start.im !== 0 || end.im !== 0) throw new CalcError('求和/求积范围必须为实数');
        if (!Number.isInteger(start.re) || !Number.isInteger(end.re)) {
          throw new CalcError('求和/求积范围必须为整数');
        }
        const argExpr = args[2]!;
        const tStart = this.tokens[argExpr.start]!;
        const tEnd = this.tokens[argExpr.end]!;
        const slice = this.input.slice(tStart.start, tEnd.end + 1);
        const lo = Math.min(start.re, end.re);
        const hi = Math.max(start.re, end.re);
        const dir = start.re <= end.re ? 1 : -1;
        let acc: Cpx = name === 'sum' ? cpx(0) : cpx(1);
        for (let k = start.re; dir > 0 ? k <= hi : k >= lo; k += dir) {
          const sub = evaluateExpr(slice, { ...this.vars, k: cpx(k) });
          acc = name === 'sum' ? cAdd(acc, sub) : cMul(acc, sub);
        }
        return acc;
      }
      default:
        throw new CalcError(`未知函数: ${name}`);
    }
  }
}

function trig(name: string, z: Cpx, deg: boolean): Cpx {
  const v = deg ? toRad(z) : z;
  let r: Cpx;
  switch (name.replace(/d$/, '')) {
    case 'sin':
      r = cSin(v);
      break;
    case 'cos':
      r = cCos(v);
      break;
    case 'tan':
      r = cTan(v);
      break;
    case 'asin':
      r = cAsin(v);
      break;
    case 'acos':
      r = cAcos(v);
      break;
    case 'atan':
      r = cAtan(v);
      break;
    default:
      throw new CalcError(`未知函数: ${name}`);
  }
  return deg ? toDeg(r) : r;
}

/* ===== Internal evaluation ===== */

export function evaluateExpr(input: string, vars: Record<string, Cpx>): Cpx {
  return new Parser(tokenize(input), input, vars).parse();
}

// Simple expression cache to avoid re-parsing in Newton iterations
export const exprCache = new Map<string, (x: number) => number>();

export function getEvaluator(expr: string): (x: number) => number {
  let evaluator = exprCache.get(expr);
  if (!evaluator) {
    evaluator = (x: number) => {
      const vars: Record<string, Cpx> = { x: cpx(x) };
      return evaluateExpr(expr, vars).re;
    };
    exprCache.set(expr, evaluator);
  }
  return evaluator;
}
