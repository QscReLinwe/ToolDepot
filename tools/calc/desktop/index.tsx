import type { ToolViewProps } from '@tooldepot/types';
import { type FC, useCallback, useEffect, useRef, useState } from 'react';
import type { CalcInput, CalcResult } from '../core/index.js';
import {
  backspace,
  type Cursor,
  clearTree,
  createEmptyTree,
  deleteForward,
  insertConstant,
  insertDecimal,
  insertDigit,
  insertFactorial,
  insertFraction,
  insertFunction,
  insertNegate,
  insertOperator,
  insertParen,
  insertPercent,
  insertPower,
  insertProd,
  insertSum,
  insertVar,
  type MathNode,
  moveDown,
  moveEnd,
  moveHome,
  moveLeft,
  moveRight,
  moveUp,
  serializeTree,
} from './expr-tree';
import { MathNodeView } from './MathNodeView';
import './calc.css';

/* ===== Tab & Keypad Definitions ===== */

type TabId = 'main' | 'func' | 'abc';

type KeyAction =
  | { type: 'digit'; digit: string }
  | { type: 'decimal' }
  | { type: 'operator'; op: '+' | '-' | '×' | '÷' | '=' }
  | { type: 'backspace' }
  | { type: 'clear' }
  | { type: 'evaluate' }
  | { type: 'negate' }
  | { type: 'power' }
  | { type: 'function'; name: string }
  | { type: 'fraction' }
  | { type: 'percent' }
  | { type: 'factorial' }
  | { type: 'paren' }
  | { type: 'constant'; value: 'π' | 'e' | 'i' }
  | { type: 'var'; letter: string }
  | { type: 'sum' }
  | { type: 'prod' };

interface KeyDef {
  label: string;
  action: KeyAction;
  wide?: boolean;
  /** Button spans N rows (CSS grid-row: span N). */
  rowSpan?: number;
  /** This cell is visually occupied by a rowSpan button above — skip rendering. */
  consumed?: boolean;
}
type KeyGrid = KeyDef[][];

const MAIN_KEYS: KeyGrid = [
  [
    { label: '(', action: { type: 'paren' } },
    { label: ')', action: { type: 'paren' } },
    { label: 'π', action: { type: 'constant', value: 'π' } },
    { label: 'e', action: { type: 'constant', value: 'e' } },
    { label: 'i', action: { type: 'constant', value: 'i' } },
    { label: 'AC', action: { type: 'clear' } },
  ],
  [
    { label: '7', action: { type: 'digit', digit: '7' } },
    { label: '8', action: { type: 'digit', digit: '8' } },
    { label: '9', action: { type: 'digit', digit: '9' } },
    { label: 'xʸ', action: { type: 'power' } },
    { label: '√', action: { type: 'function', name: 'sqrt' } },
    { label: 'DEL', action: { type: 'backspace' } },
  ],
  [
    { label: '4', action: { type: 'digit', digit: '4' } },
    { label: '5', action: { type: 'digit', digit: '5' } },
    { label: '6', action: { type: 'digit', digit: '6' } },
    { label: '+', action: { type: 'operator', op: '+' }, rowSpan: 2 },
    { label: '−', action: { type: 'operator', op: '-' } },
    { label: 'a/b', action: { type: 'fraction' } },
  ],
  [
    { label: '1', action: { type: 'digit', digit: '1' } },
    { label: '2', action: { type: 'digit', digit: '2' } },
    { label: '3', action: { type: 'digit', digit: '3' } },
    { label: '+', action: { type: 'operator', op: '+' }, consumed: true },
    { label: '×', action: { type: 'operator', op: '×' } },
    { label: '=', action: { type: 'evaluate' }, rowSpan: 2 },
  ],
  [
    { label: '.', action: { type: 'decimal' } },
    { label: '0', action: { type: 'digit', digit: '0' } },
    { label: '±', action: { type: 'negate' } },
    { label: '%', action: { type: 'percent' } },
    { label: '÷', action: { type: 'operator', op: '÷' } },
    { label: '=', action: { type: 'evaluate' }, consumed: true },
  ],
];

const FUNC_KEYS: KeyGrid = [
  [
    { label: 'xʸ', action: { type: 'power' } },
    { label: '√', action: { type: 'function', name: 'sqrt' } },
    { label: 'log', action: { type: 'function', name: 'log' } },
    { label: 'ln', action: { type: 'function', name: 'ln' } },
    { label: 'eˣ', action: { type: 'function', name: 'exp' } },
    { label: '|x|', action: { type: 'function', name: 'abs' } },
  ],
  [
    { label: 'sin', action: { type: 'function', name: 'sin' } },
    { label: 'cos', action: { type: 'function', name: 'cos' } },
    { label: 'tan', action: { type: 'function', name: 'tan' } },
    { label: 'asin', action: { type: 'function', name: 'asin' } },
    { label: 'acos', action: { type: 'function', name: 'acos' } },
    { label: 'atan', action: { type: 'function', name: 'atan' } },
  ],
  [
    { label: 'Σ', action: { type: 'sum' } },
    { label: '∏', action: { type: 'prod' } },
    { label: '!', action: { type: 'factorial' } },
    { label: 'π', action: { type: 'constant', value: 'π' } },
    { label: 'e', action: { type: 'constant', value: 'e' } },
    { label: 'i', action: { type: 'constant', value: 'i' } },
  ],
  [
    { label: '(', action: { type: 'paren' } },
    { label: ')', action: { type: 'paren' } },
    { label: 'ans', action: { type: 'var', letter: 'ans' } },
    { label: '=', action: { type: 'evaluate' } },
    { label: 'DEL', action: { type: 'backspace' } },
    { label: 'AC', action: { type: 'clear' } },
  ],
];

const ABC_KEYS: KeyGrid = [
  [
    { label: 'a', action: { type: 'var', letter: 'a' } },
    { label: 'b', action: { type: 'var', letter: 'b' } },
    { label: 'c', action: { type: 'var', letter: 'c' } },
    { label: 'd', action: { type: 'var', letter: 'd' } },
    { label: 'e', action: { type: 'var', letter: 'e' } },
    { label: 'f', action: { type: 'var', letter: 'f' } },
  ],
  [
    { label: 'g', action: { type: 'var', letter: 'g' } },
    { label: 'h', action: { type: 'var', letter: 'h' } },
    { label: 'i', action: { type: 'var', letter: 'i' } },
    { label: 'j', action: { type: 'var', letter: 'j' } },
    { label: 'k', action: { type: 'var', letter: 'k' } },
    { label: 'l', action: { type: 'var', letter: 'l' } },
  ],
  [
    { label: 'm', action: { type: 'var', letter: 'm' } },
    { label: 'n', action: { type: 'var', letter: 'n' } },
    { label: 'o', action: { type: 'var', letter: 'o' } },
    { label: 'p', action: { type: 'var', letter: 'p' } },
    { label: 'q', action: { type: 'var', letter: 'q' } },
    { label: 'r', action: { type: 'var', letter: 'r' } },
  ],
  [
    { label: 's', action: { type: 'var', letter: 's' } },
    { label: 't', action: { type: 'var', letter: 't' } },
    { label: 'u', action: { type: 'var', letter: 'u' } },
    { label: 'v', action: { type: 'var', letter: 'v' } },
    { label: 'w', action: { type: 'var', letter: 'w' } },
    { label: 'x', action: { type: 'var', letter: 'x' } },
  ],
  [
    { label: 'y', action: { type: 'var', letter: 'y' } },
    { label: 'z', action: { type: 'var', letter: 'z' } },
    { label: 'ans', action: { type: 'var', letter: 'ans' } },
    { label: '=', action: { type: 'operator', op: '=' } },
    { label: 'DEL', action: { type: 'backspace' } },
    { label: 'AC', action: { type: 'clear' } },
  ],
];

const TABS: Record<TabId, { label: string; keys: KeyGrid }> = {
  main: { label: '主键盘', keys: MAIN_KEYS },
  func: { label: '函数', keys: FUNC_KEYS },
  abc: { label: '字母', keys: ABC_KEYS },
};

/* ===== Helpers ===== */

/** Make serialized output human-readable (back from core format). */
function normalizeDisplay(s: string): string {
  return s.replace(/\*/g, '×').replace(/\//g, '÷');
}

/* ===== Component ===== */

export const Component: FC<ToolViewProps<CalcInput, CalcResult>> = ({ tool }) => {
  const [tree, setTree] = useState<MathNode>(createEmptyTree);
  const [cursor, setCursor] = useState<Cursor>({ path: [], slot: '', offset: 1 });
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [history, setHistory] = useState<Array<{ expr: string; result: string }>>([]);
  const [tab, setTab] = useState<TabId>('main');
  const [vars, setVars] = useState<Record<string, number>>({});
  const [lastResult, setLastResult] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  /* ── Tree operation ── */

  const handleOp = useCallback(
    (op: (t: MathNode, c: Cursor) => { tree: MathNode; cursor: Cursor }) => {
      const { tree: nt, cursor: nc } = op(tree, cursor);
      setTree(nt);
      setCursor(nc);
      setResult('');
      setError('');
    },
    [tree, cursor],
  );

  /* ── Evaluate ── */

  const evaluate = useCallback(async () => {
    const serialized = serializeTree(tree);
    if (!serialized || serialized === '0') return;
    setResult('');
    setError('');

    try {
      /* Variable assignment: tree is binary('=', var('name'), rhs) */
      const assignMatch =
        tree.type === 'binary' && tree.op === '=' && tree.left.type === 'var'
          ? { varName: tree.left.value, rhs: serializeTree(tree.right) }
          : null;

      if (assignMatch) {
        const { varName, rhs } = assignMatch;
        const out = await tool.run({ expression: rhs, vars } as CalcInput);
        if (!out.ok) {
          setError(out.error ?? '');
          return;
        }
        const val = out.data!.value!;
        const r = out.data!.result;
        setVars((pv) => ({ ...pv, [varName]: val.re }));
        setLastResult(r);
        setResult(`→ ${r}`);
        setHistory((h) => [{ expr: normalizeDisplay(serialized), result: `→ ${r}` }, ...h].slice(0, 50));
        return;
      }

      /* Normal evaluation — inject ans if available */
      const evalVars = { ...vars };
      if (lastResult) {
        const lastNum = Number(lastResult);
        if (!Number.isNaN(lastNum)) evalVars.ans = lastNum;
      }
      const out = await tool.run({ expression: serialized, vars: evalVars } as CalcInput);
      if (!out.ok) {
        setError(out.error ?? '');
        return;
      }
      const r = out.data!.result;
      setLastResult(r);
      setResult(r);
      setHistory((h) => [{ expr: normalizeDisplay(serialized), result: r }, ...h].slice(0, 50));
    } catch (e) {
      setError(String(e));
    }
  }, [tree, tool, vars, lastResult]);

  /* ── Key action router ── */

  const handleKeyAction = useCallback(
    (action: KeyAction) => {
      switch (action.type) {
        case 'digit':
          handleOp((t, c) => insertDigit(t, c, action.digit));
          break;
        case 'decimal':
          handleOp(insertDecimal);
          break;
        case 'operator':
          handleOp((t, c) => insertOperator(t, c, action.op));
          break;
        case 'backspace':
          handleOp(backspace);
          break;
        case 'clear':
          setTree(clearTree());
          setCursor({ path: [], slot: '', offset: 1 });
          setResult('');
          setError('');
          break;
        case 'evaluate':
          void evaluate();
          break;
        case 'negate':
          handleOp(insertNegate);
          break;
        case 'power':
          handleOp(insertPower);
          break;
        case 'function':
          handleOp((t, c) => insertFunction(t, c, action.name));
          break;
        case 'fraction':
          handleOp(insertFraction);
          break;
        case 'percent':
          handleOp(insertPercent);
          break;
        case 'factorial':
          handleOp(insertFactorial);
          break;
        case 'paren':
          handleOp(insertParen);
          break;
        case 'constant':
          handleOp((t, c) => insertConstant(t, c, action.value));
          break;
        case 'var':
          handleOp((t, c) => insertVar(t, c, action.letter));
          break;
        case 'sum':
          handleOp(insertSum);
          break;
        case 'prod':
          handleOp(insertProd);
          break;
      }
    },
    [handleOp, evaluate],
  );

  /* ── Keyboard ── */

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (true) {
        case /^[0-9]$/.test(e.key):
          e.preventDefault();
          handleOp((t, c) => insertDigit(t, c, e.key));
          return;
        case e.key === '.':
          e.preventDefault();
          handleOp(insertDecimal);
          return;
        case e.key === '+':
          e.preventDefault();
          handleOp((t, c) => insertOperator(t, c, '+'));
          return;
        case e.key === '-':
          e.preventDefault();
          handleOp((t, c) => insertOperator(t, c, '-'));
          return;
        case e.key === '*':
          e.preventDefault();
          handleOp((t, c) => insertOperator(t, c, '×'));
          return;
        case e.key === '/':
          e.preventDefault();
          handleOp((t, c) => insertOperator(t, c, '÷'));
          return;
        case e.key === '^':
          e.preventDefault();
          handleOp(insertPower);
          return;
        case e.key === '(' || e.key === ')':
          e.preventDefault();
          handleOp(insertParen);
          return;
        case e.key === 'Enter':
          e.preventDefault();
          void evaluate();
          return;
        case e.key === 'Escape':
          e.preventDefault();
          setTree(clearTree());
          setCursor({ path: [], slot: '', offset: 1 });
          setResult('');
          setError('');
          return;
        case e.key === 'Backspace':
          e.preventDefault();
          handleOp(backspace);
          return;
        case e.key === 'Delete':
          e.preventDefault();
          handleOp(deleteForward);
          return;
        case e.key === 'ArrowLeft':
          e.preventDefault();
          handleOp((t, c) => ({ tree: t, cursor: moveLeft(t, c) }));
          return;
        case e.key === 'ArrowRight':
          e.preventDefault();
          handleOp((t, c) => ({ tree: t, cursor: moveRight(t, c) }));
          return;
        case e.key === 'ArrowUp':
          e.preventDefault();
          handleOp((t, c) => ({ tree: t, cursor: moveUp(t, c) }));
          return;
        case e.key === 'ArrowDown':
          e.preventDefault();
          handleOp((t, c) => ({ tree: t, cursor: moveDown(t, c) }));
          return;
        case e.key === 'Home':
          e.preventDefault();
          handleOp((t, c) => ({ tree: t, cursor: moveHome(t, c) }));
          return;
        case e.key === 'End':
          e.preventDefault();
          handleOp((t, c) => ({ tree: t, cursor: moveEnd(t, c) }));
          return;
        case /^[a-zA-Z]$/.test(e.key):
          e.preventDefault();
          handleOp((t, c) => insertVar(t, c, e.key));
          return;
        case e.key === '%':
          e.preventDefault();
          handleOp(insertPercent);
          return;
        case e.key === '!':
          e.preventDefault();
          handleOp(insertFactorial);
          return;
      }
    },
    [handleOp, evaluate],
  );

  /* ── Button styling ── */

  const btnClass = (action: KeyAction): string => {
    const parts = ['calc-btn'];
    switch (action.type) {
      case 'evaluate':
        parts.push('calc-btn-eq');
        break;
      case 'backspace':
        parts.push('calc-btn-back');
        break;
      case 'clear':
        parts.push('calc-btn-clear');
        break;
      case 'operator':
        parts.push('calc-btn-op');
        break;
      case 'paren':
        parts.push('calc-btn-paren');
        break;
      case 'fraction':
        parts.push('calc-btn-frac');
        break;
      case 'function':
        parts.push('calc-btn-fn');
        break;
      case 'power':
      case 'factorial':
      case 'negate':
      case 'percent':
        parts.push('calc-btn-unary');
        break;
      case 'sum':
      case 'prod':
        parts.push('calc-btn-sp');
        break;
      case 'constant':
        parts.push('calc-btn-const');
        break;
      case 'var':
        if (action.letter === 'ans') parts.push('calc-btn-ans');
        else parts.push('calc-btn-var');
        break;
    }
    return parts.join(' ');
  };

  /* ── Render ── */

  const isAssign = tree.type === 'binary' && tree.op === '=' && tree.left.type === 'var';

  return (
    <div
      ref={containerRef}
      className="calc-panel"
      role="application"
      onKeyDown={handleKeyDown}
      style={{ outline: 'none' }}
    >
      {/* Expression display */}
      <div className="calc-display">
        <div className="calc-tree-display">
          <MathNodeView node={tree} cursor={cursor} myPath={[]} />
        </div>
        {isAssign && <div className="calc-hint-label">赋值</div>}
        {!isAssign && result && <div className="calc-result">= {result}</div>}
        {error && <div className="calc-error-text">{error}</div>}
      </div>

      {/* Tab bar */}
      <div className="calc-tabs">
        {(Object.keys(TABS) as TabId[]).map((tid) => (
          <button
            key={tid}
            type="button"
            className={`calc-tab${tid === tab ? ' calc-tab-active' : ''}`}
            onClick={() => setTab(tid)}
          >
            {TABS[tid].label}
          </button>
        ))}
      </div>

      {/* Keypad */}
      <div className="calc-body calc-grid">
        {TABS[tab].keys
          .flatMap((row, ri) => row.map((key, ki) => ({ ...key, _row: ri, _col: ki })))
          .filter((k) => !k.consumed)
          .map((key) => (
            <button
              key={`${key._row}-${key._col}`}
              type="button"
              className={`${btnClass(key.action)}${key.wide ? ' calc-btn-wide' : ''}`}
              style={{
                gridRow: key.rowSpan && key.rowSpan > 1 ? `${key._row + 1} / span ${key.rowSpan}` : `${key._row + 1}`,
                gridColumn: `${key._col + 1}`,
              }}
              onClick={() => handleKeyAction(key.action)}
            >
              {key.label}
            </button>
          ))}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="calc-history">
          <div className="calc-history-title">历史记录</div>
          {history.map((h, i) => (
            <div key={i} className="calc-history-item">
              {h.expr} = {h.result}
            </div>
          ))}
        </div>
      )}

      <div className="calc-hint">直接输入 · 方向键导航 · 回车计算 · Esc 清除</div>
    </div>
  );
};
