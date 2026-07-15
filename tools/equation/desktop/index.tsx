import type { ToolViewProps } from '@tooldepot/types';
import { type FC, useCallback, useEffect, useRef, useState } from 'react';
import type { EquationInput, EquationResult } from '../core/index.js';
import { evaluateAt, solveEquation } from '../core/index.js';
import './equation.css';

/* ---------- Button grid ---------- */

type BtnKind = 'num' | 'var' | 'op' | 'fn' | 'const' | 'paren' | 'eq' | 'back' | 'clear' | 'solve';

interface EqBtn {
  label: string;
  kind: BtnKind;
  value?: string;
  span?: number;
}

const BUTTONS: EqBtn[][] = [
  [
    { label: 'sin', kind: 'fn' },
    { label: 'cos', kind: 'fn' },
    { label: 'tan', kind: 'fn' },
    { label: '清除', kind: 'clear' },
  ],
  [
    { label: 'π', kind: 'const', value: 'pi' },
    { label: 'e', kind: 'const', value: 'e' },
    { label: '^', kind: 'op', value: '^' },
    { label: '÷', kind: 'op', value: '/' },
  ],
  [
    { label: '7', kind: 'num' },
    { label: '8', kind: 'num' },
    { label: '9', kind: 'num' },
    { label: '×', kind: 'op', value: '*' },
  ],
  [
    { label: '4', kind: 'num' },
    { label: '5', kind: 'num' },
    { label: '6', kind: 'num' },
    { label: '−', kind: 'op', value: '-' },
  ],
  [
    { label: '1', kind: 'num' },
    { label: '2', kind: 'num' },
    { label: '3', kind: 'num' },
    { label: '+', kind: 'op', value: '+' },
  ],
  [
    { label: '0', kind: 'num' },
    { label: 'x', kind: 'var' },
    { label: '(', kind: 'paren' },
    { label: ')', kind: 'paren' },
    { label: '=', kind: 'eq' },
  ],
];

/* ---------- constants ---------- */

const INIT_VIEWPORT = { xMin: -10, xMax: 10, yMin: -10, yMax: 10 };
const CANVAS_H = 420;
const RHS_COLOR = '#E8751A';

interface HoverInfo {
  px: number;
  py: number;
  x: number;
  lx: number;
  rx: number;
}

/* ---------- component ---------- */

export const Component: FC<ToolViewProps<EquationInput, EquationResult>> = ({ tool }) => {
  const [eqInput, setEqInput] = useState('2*x + 3 = 7');
  const [result, setResult] = useState<EquationResult | null>(null);
  const [error, setError] = useState('');
  const [vp, setVp] = useState(INIT_VIEWPORT);
  const [hover, setHover] = useState<HoverInfo | null>(null);
  const [graphKey, setGraphKey] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<{ active: boolean; startX: number; startY: number; vpX: number; vpY: number }>({
    active: false,
    startX: 0,
    startY: 0,
    vpX: 0,
    vpY: 0,
  });

  /* ==========================
     Input handling
     ========================== */

  const append = useCallback((s: string) => {
    setEqInput((p) => p + s);
    setError('');
  }, []);

  const handleBack = useCallback(() => {
    setEqInput((prev) => prev.replace(/\s+$/, '').slice(0, -1));
    setError('');
  }, []);

  const handleClear = useCallback(() => {
    setEqInput('');
    setError('');
    setResult(null);
  }, []);

  const handleSolve = useCallback(() => {
    try {
      const r = solveEquation(eqInput);
      setResult(r);
      setError('');
      setGraphKey((k) => k + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setResult(null);
    }
  }, [eqInput]);

  const handleClick = useCallback(
    (btn: EqBtn) => {
      switch (btn.kind) {
        case 'num':
          append(btn.label);
          break;
        case 'var':
          append('x');
          break;
        case 'op':
          append(` ${btn.value!} `);
          break;
        case 'fn':
          append(`${btn.label}(`);
          break;
        case 'const':
          append(btn.value!);
          break;
        case 'paren':
          append(btn.label);
          break;
        case 'eq':
          append(' = ');
          break;
        case 'back':
          handleBack();
          break;
        case 'clear':
          handleClear();
          break;
        case 'solve':
          handleSolve();
          break;
      }
    },
    [append, handleBack, handleClear, handleSolve],
  );

  /* ---- keyboard ---- */
  const keyMap: Record<string, string> = {
    '0': '0',
    '1': '1',
    '2': '2',
    '3': '3',
    '4': '4',
    '5': '5',
    '6': '6',
    '7': '7',
    '8': '8',
    '9': '9',
    '+': '+',
    '-': '-',
    '*': '*',
    '/': '/',
    '^': '^',
    '(': '(',
    ')': ')',
    x: 'x',
    X: 'x',
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSolve();
        return;
      }
      if (e.key === 'Backspace') {
        handleBack();
        return;
      }
      if (e.key === 'Escape') {
        handleClear();
        return;
      }
      const mapped = keyMap[e.key];
      if (mapped) {
        e.preventDefault();
        append('+-*/^'.includes(e.key) || e.key === '(' || e.key === ')' ? ` ${mapped} ` : mapped);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [append, handleSolve, handleBack, handleClear]);

  /* ==========================
     Canvas drawing
     ========================== */

  const hiDpi = useCallback((canvas: HTMLCanvasElement, w: number, h: number): CanvasRenderingContext2D | null => {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.scale(dpr, dpr);
    return ctx;
  }, []);

  const drawCurve = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      toPx: (x: number, y: number) => [number, number],
      fn: string,
      color: string,
      xMin: number,
      xMax: number,
      steps: number,
    ) => {
      const points: { x: number; y: number }[] = [];
      let valid = false;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = xMin + t * (xMax - xMin);
        try {
          const y = evaluateAt(fn, x);
          if (Number.isFinite(y)) {
            points.push({ x, y });
            valid = true;
          } else if (points.length > 0 && i < steps) points.push({ x: NaN, y: NaN });
        } catch {
          /* skip */
        }
      }
      if (!valid) return;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.beginPath();
      let started = false;
      for (const p of points) {
        if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) {
          started = false;
          continue;
        }
        const [px, py] = toPx(p.x, p.y);
        if (!started) {
          ctx.moveTo(px, py);
          started = true;
        } else ctx.lineTo(px, py);
      }
      ctx.stroke();
    },
    [],
  );

  const drawGraph = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#0EA5E9';
    const W = canvas.getBoundingClientRect().width;
    if (W < 10) return;
    const H = CANVAS_H;
    const ctx = hiDpi(canvas, W, H);
    if (!ctx) return;

    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, W, H);

    const { xMin, xMax, yMin, yMax } = vp;
    const steps = 500;
    const M = { left: 50, right: 20, top: 25, bottom: 25 };
    const plotW = W - M.left - M.right;
    const plotH = H - M.top - M.bottom;

    const toPx = (x: number, y: number): [number, number] => [
      M.left + ((x - xMin) / (xMax - xMin)) * plotW,
      M.top + ((yMax - y) / (yMax - yMin)) * plotH,
    ];

    // grid lines
    ctx.strokeStyle = '#eaeaea';
    ctx.lineWidth = 1;
    const gridStep = 10 ** Math.floor(Math.log10(Math.max(xMax - xMin, yMax - yMin) / 5));
    for (let x = Math.ceil(xMin / gridStep) * gridStep; x <= xMax; x += gridStep) {
      const [px] = toPx(x, 0);
      if (px < M.left || px > W - M.right) continue;
      ctx.beginPath();
      ctx.moveTo(px, M.top);
      ctx.lineTo(px, M.top + plotH);
      ctx.stroke();
    }
    for (let y = Math.ceil(yMin / gridStep) * gridStep; y <= yMax; y += gridStep) {
      const [, py] = toPx(0, y);
      if (py < M.top || py > M.top + plotH) continue;
      ctx.beginPath();
      ctx.moveTo(M.left, py);
      ctx.lineTo(M.left + plotW, py);
      ctx.stroke();
    }

    // axes
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1.5;
    if (0 >= yMin && 0 <= yMax) {
      const [, ay] = toPx(0, 0);
      ctx.beginPath();
      ctx.moveTo(M.left, ay);
      ctx.lineTo(M.left + plotW, ay);
      ctx.stroke();
    }
    if (0 >= xMin && 0 <= xMax) {
      const [ax] = toPx(0, 0);
      ctx.beginPath();
      ctx.moveTo(ax, M.top);
      ctx.lineTo(ax, M.top + plotH);
      ctx.stroke();
    }

    // LHS (accent) and RHS (orange) curves
    const sides = eqInput.split('=');
    if (sides.length === 2) {
      const leftFn = sides[0]!.trim();
      const rightFn = sides[1]!.trim();
      try {
        drawCurve(ctx, toPx, leftFn, accent, xMin, xMax, steps);
        drawCurve(ctx, toPx, rightFn, RHS_COLOR, xMin, xMax, steps);
      } catch {
        ctx.fillStyle = '#d32f2f';
        ctx.font = '13px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('方程无效，请检查输入', W / 2, H / 2);
      }

      if (result) {
        try {
          const lhsVal = evaluateAt(leftFn, result.x);
          const rhsVal = evaluateAt(rightFn, result.x);
          const eqVal =
            Number.isFinite(lhsVal) && Number.isFinite(rhsVal)
              ? (lhsVal + rhsVal) / 2
              : Number.isFinite(rhsVal)
                ? rhsVal
                : lhsVal;
          const [ix, iy] = toPx(result.x, eqVal);
          // outer dot
          ctx.fillStyle = '#E53935';
          ctx.beginPath();
          ctx.arc(ix, iy, 6, 0, Math.PI * 2);
          ctx.fill();
          // inner dot
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.arc(ix, iy, 3, 0, Math.PI * 2);
          ctx.fill();
        } catch {
          /* ignore */
        }
      }
    }

    // legend
    ctx.font = '12px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = accent;
    ctx.fillText('■ 左侧（LHS）', M.left, 4);
    ctx.fillStyle = RHS_COLOR;
    ctx.fillText('■ 右侧（RHS）', M.left + 80, 4);

    // viewport info
    ctx.fillStyle = '#999';
    ctx.font = '11px system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText(`[${xMin.toFixed(1)}, ${xMax.toFixed(1)}] × [${yMin.toFixed(1)}, ${yMax.toFixed(1)}]`, W - M.right, 4);
  }, [eqInput, hiDpi, vp, result, graphKey]);

  useEffect(() => {
    drawGraph();
  }, [drawGraph, graphKey]);
  useEffect(() => {
    const onResize = () => drawGraph();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [drawGraph]);

  /* ---- graph interaction: zoom / pan ---- */

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const Z = 1.15;
    const dir = e.deltaY < 0 ? 1 / Z : Z;
    setVp((prev) => {
      const cx = (prev.xMin + prev.xMax) / 2;
      const cy = (prev.yMin + prev.yMax) / 2;
      return {
        xMin: cx - ((prev.xMax - prev.xMin) / 2) * dir,
        xMax: cx + ((prev.xMax - prev.xMin) / 2) * dir,
        yMin: cy - ((prev.yMax - prev.yMin) / 2) * dir,
        yMax: cy + ((prev.yMax - prev.yMin) / 2) * dir,
      };
    });
  }, []);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      dragRef.current.active = true;
      dragRef.current.startX = e.clientX;
      dragRef.current.startY = e.clientY;
      dragRef.current.vpX = vp.xMin;
      dragRef.current.vpY = vp.yMin;
      e.preventDefault();
    },
    [vp],
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const W = rect.width;
      const M = { left: 50, right: 20, top: 25, bottom: 25 };
      const plotW = Math.max(W - M.left - M.right, 1);
      const plotH = Math.max(CANVAS_H - M.top - M.bottom, 1);

      // hover readout
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      if (px >= M.left && px <= W - M.right && py >= M.top && py <= M.top + plotH) {
        const x = vp.xMin + ((px - M.left) / plotW) * (vp.xMax - vp.xMin);
        const sides = eqInput.split('=');
        let lx = NaN,
          rx = NaN;
        if (sides.length === 2) {
          try {
            lx = evaluateAt(sides[0]!.trim(), x);
          } catch {
            /* ignore */
          }
          try {
            rx = evaluateAt(sides[1]!.trim(), x);
          } catch {
            /* ignore */
          }
        }
        setHover({ px, py, x, lx, rx });
      } else {
        setHover(null);
      }

      if (!dragRef.current.active) return;
      const dx = ((e.clientX - dragRef.current.startX) * (vp.xMax - vp.xMin)) / plotW;
      const dy = ((e.clientY - dragRef.current.startY) * (vp.yMax - vp.yMin)) / plotH;
      setVp((prev) => ({
        xMin: dragRef.current.vpX - dx,
        xMax: dragRef.current.vpX - dx + (prev.xMax - prev.xMin),
        yMin: dragRef.current.vpY + dy,
        yMax: dragRef.current.vpY + dy + (prev.yMax - prev.yMin),
      }));
    },
    [vp, eqInput],
  );

  const onMouseUp = useCallback(() => {
    dragRef.current.active = false;
  }, []);
  const onMouseLeave = useCallback(() => {
    dragRef.current.active = false;
    setHover(null);
  }, []);
  const resetViewport = useCallback(() => {
    setVp(INIT_VIEWPORT);
  }, []);

  /* ==========================
     Render
     ========================== */

  return (
    <div className="equation-wrap animate-fade-in-up">
      <h2 className="equation-title">{tool.name}</h2>

      <div className="equation-layout">
        {/* Left: equation input + button grid */}
        <div className="equation-panel">
          <div className="equation-field-label">方程</div>
          <div className="equation-display">{eqInput || '（空）'}</div>
          {error && <div className="equation-error">{error}</div>}

          <div className="equation-grid">
            {BUTTONS.map((row, ri) => (
              <div key={ri} className="equation-row">
                {row.map((btn) => {
                  let cls = 'equation-btn';
                  if (btn.kind === 'fn' || btn.kind === 'const') cls += ' fn';
                  if (btn.kind === 'op' || btn.kind === 'paren' || btn.kind === 'eq') cls += ' op';
                  if (btn.kind === 'clear') cls += ' clear';
                  if (btn.kind === 'back') cls += ' back';
                  return (
                    <button key={btn.label} type="button" className={cls} onClick={() => handleClick(btn)}>
                      {btn.label}
                    </button>
                  );
                })}
              </div>
            ))}
            <div className="equation-row equation-row-wide">
              <button type="button" className="equation-btn back" onClick={handleBack}>
                ← 退格
              </button>
              <button type="button" className="equation-btn solve" onClick={handleSolve}>
                求解
              </button>
            </div>
          </div>
        </div>

        {/* Right: result display */}
        <div className="equation-panel">
          <div className="equation-field-label">结果</div>
          {result ? (
            <div className="equation-result">
              <div className="equation-result-x">
                <span className="equation-result-x-label">x =</span>
                <span className="equation-result-x-value">{result.x.toFixed(8)}</span>
              </div>
              <div className="equation-result-meta">
                <div>
                  迭代次数：<strong>{result.iterations}</strong>
                </div>
                <div>
                  误差：<strong>{result.error.toExponential(2)}</strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="equation-result equation-result-empty">点击“求解”或使用按钮输入方程，然后求解</div>
          )}

          <div className="equation-examples">
            <div className="equation-examples-title">示例</div>
            <button
              type="button"
              className="equation-example"
              onClick={() => {
                setEqInput('2*x + 3 = 7');
                setError('');
              }}
            >
              2*x + 3 = 7
            </button>
            <button
              type="button"
              className="equation-example"
              onClick={() => {
                setEqInput('x^2 = 4');
                setError('');
              }}
            >
              x^2 = 4
            </button>
            <button
              type="button"
              className="equation-example"
              onClick={() => {
                setEqInput('sin(x) = 0.5');
                setError('');
              }}
            >
              sin(x) = 0.5
            </button>
            <button
              type="button"
              className="equation-example"
              onClick={() => {
                setEqInput('cos(x) = x');
                setError('');
              }}
            >
              cos(x) = x
            </button>
          </div>
        </div>
      </div>

      {/* Canvas below */}
      <div className="equation-canvas-section">
        <div className="equation-canvas-head">
          <span className="equation-field-label">函数图像</span>
          <button type="button" className="equation-btn-reset" onClick={resetViewport}>
            重置视图
          </button>
        </div>
        <div
          className="equation-canvas-wrap"
          role="application"
          onWheel={onWheel}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
        >
          <canvas ref={canvasRef} className="equation-canvas" />
          {hover && (
            <div
              className="equation-tooltip"
              style={{ '--tx': `${hover.px + 12}px`, '--ty': `${hover.py + 12}px` } as React.CSSProperties}
            >
              <div>x = {hover.x.toFixed(4)}</div>
              <div className="equation-tooltip-lhs">左侧 = {Number.isFinite(hover.lx) ? hover.lx.toFixed(4) : '—'}</div>
              <div className="equation-tooltip-rhs">右侧 = {Number.isFinite(hover.rx) ? hover.rx.toFixed(4) : '—'}</div>
            </div>
          )}
        </div>
        <div className="equation-hint">拖动平移 · 滚动缩放 · 悬停查看坐标（紫色=左侧，橙色=右侧，红点=交点）</div>
      </div>
    </div>
  );
};

export default Component;
