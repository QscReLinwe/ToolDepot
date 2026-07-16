import type { ToolViewProps } from '@tooldepot/types';
import { type FC, useCallback, useEffect, useRef, useState } from 'react';
import { evaluateFunction, slopeAt } from '../core/index.js';
import './graph.css';

/* ---------- constants ---------- */

const CANVAS_H = 420; // fixed height prevents stretching
const M = { left: 48, right: 18, top: 18, bottom: 28 };
const STEPS = 600;

interface Viewport {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}
interface Hover {
  px: number;
  py: number;
  x: number;
  fx: number;
  slope: number;
}

const DEFAULT_X: Viewport = { xMin: -10, xMax: 10, yMin: -10, yMax: 10 };

const PAD: { label: string; insert: string }[] = [
  { label: 'sin', insert: 'sin(' },
  { label: 'cos', insert: 'cos(' },
  { label: 'tan', insert: 'tan(' },
  { label: 'asin', insert: 'asin(' },
  { label: 'acos', insert: 'acos(' },
  { label: 'atan', insert: 'atan(' },
  { label: '^', insert: '^' },
  { label: 'sqrt', insert: 'sqrt(' },
  { label: 'abs', insert: 'abs(' },
  { label: 'pi', insert: 'pi' },
  { label: 'e', insert: 'e' },
  { label: 'ln', insert: 'ln(' },
  { label: 'log', insert: 'log(' },
];

/* ---------- helpers ---------- */

function formatNum(n: number): string {
  if (n === 0) return '0';
  if (!Number.isFinite(n)) return '—';
  if (Math.abs(n) >= 1000 || Math.abs(n) < 0.001) return n.toExponential(1);
  return String(Math.round(n * 1000) / 1000);
}

/** Safe wrapper for slopeAt() that returns NaN instead of throwing. */
function safeSlope(expr: string, x: number): number {
  try {
    return slopeAt(expr, x);
  } catch {
    return NaN;
  }
}

function autoScaleY(fn: string, xMin: number, xMax: number): [number, number] {
  let lo = Infinity;
  let hi = -Infinity;
  for (let i = 0; i <= STEPS; i++) {
    const x = xMin + (i / STEPS) * (xMax - xMin);
    const y = evaluateFunction(fn, x);
    if (Number.isFinite(y)) {
      if (y < lo) lo = y;
      if (y > hi) hi = y;
    }
  }
  if (!Number.isFinite(lo) || !Number.isFinite(hi)) return [-10, 10];
  if (lo === hi) return [lo - 5, hi + 5];
  const pad = (hi - lo) * 0.12;
  return [lo - pad, hi + pad];
}

function drawCurve(
  ctx: CanvasRenderingContext2D,
  toPx: (x: number, y: number) => [number, number],
  fn: string,
  color: string,
  xMin: number,
  xMax: number,
): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.beginPath();
  let started = false;
  for (let i = 0; i <= STEPS; i++) {
    const x = xMin + (i / STEPS) * (xMax - xMin);
    const y = evaluateFunction(fn, x);
    if (!Number.isFinite(y)) {
      started = false;
      continue;
    }
    const [px, py] = toPx(x, y);
    if (!started) {
      ctx.moveTo(px, py);
      started = true;
    } else ctx.lineTo(px, py);
  }
  ctx.stroke();
}

function drawTooltip(ctx: CanvasRenderingContext2D, h: Hover, W: number, H: number): void {
  const lines = [
    `x = ${formatNum(h.x)}`,
    `f(x) = ${formatNum(h.fx)}`,
    `斜率 = ${Number.isFinite(h.slope) ? formatNum(h.slope) : '—'}`,
  ];
  ctx.font = '12px system-ui, sans-serif';
  let tw = 0;
  for (const l of lines) tw = Math.max(tw, ctx.measureText(l).width);
  const padX = 8;
  const padY = 6;
  const lh = 16;
  const boxW = tw + padX * 2;
  const boxH = lines.length * lh + padY * 2;
  let bx = h.px + 12;
  let by = h.py + 12;
  if (bx + boxW > W) bx = h.px - boxW - 12;
  if (by + boxH > H) by = h.py - boxH - 12;
  if (bx < 0) bx = 4;
  if (by < 0) by = 4;
  ctx.fillStyle = 'rgba(17,17,17,0.85)';
  ctx.beginPath();
  ctx.roundRect(bx, by, boxW, boxH, 6);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  lines.forEach((l, i) => {
    ctx.fillText(l, bx + padX, by + padY + i * lh);
  });
}

/* ---------- component ---------- */

export const Component: FC<ToolViewProps> = () => {
  const [expr, setExpr] = useState('sin(x)');
  const [vp, setVp] = useState<Viewport>(DEFAULT_X);
  const [error, setError] = useState('');
  const [hover, setHover] = useState<Hover | null>(null);
  const [drawKey, setDrawKey] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<{ active: boolean; startX: number; startY: number; vpX: number; vpY: number }>({
    active: false,
    startX: 0,
    startY: 0,
    vpX: 0,
    vpY: 0,
  });

  const fn = expr.trim() || 'sin(x)';

  /* ---- initial auto-scale ---- */
  useEffect(() => {
    const [yMin, yMax] = autoScaleY(fn, DEFAULT_X.xMin, DEFAULT_X.xMax);
    setVp({ ...DEFAULT_X, yMin, yMax });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- canvas hi-dpi setup ---- */
  const hiDpi = useCallback((canvas: HTMLCanvasElement, w: number, h: number): CanvasRenderingContext2D | null => {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  }, []);

  /* ---- draw ---- */
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = canvas.getBoundingClientRect().width;
    if (W < 10) return;
    const H = CANVAS_H;
    const ctx = hiDpi(canvas, W, H);
    if (!ctx) return;
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#1A73E8';

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, W, H);

    const { xMin, xMax, yMin, yMax } = vp;
    const plotW = W - M.left - M.right;
    const plotH = H - M.top - M.bottom;
    const toPx = (x: number, y: number): [number, number] => [
      M.left + ((x - xMin) / (xMax - xMin)) * plotW,
      M.top + ((yMax - y) / (yMax - yMin)) * plotH,
    ];

    // grid
    ctx.strokeStyle = '#eef0f3';
    ctx.lineWidth = 1;
    const span = Math.max(xMax - xMin, yMax - yMin);
    const step = 10 ** Math.floor(Math.log10(span / 5)) || 1;
    for (let x = Math.ceil(xMin / step) * step; x <= xMax; x += step) {
      const [px] = toPx(x, 0);
      if (px < M.left || px > W - M.right) continue;
      ctx.beginPath();
      ctx.moveTo(px, M.top);
      ctx.lineTo(px, M.top + plotH);
      ctx.stroke();
    }
    for (let y = Math.ceil(yMin / step) * step; y <= yMax; y += step) {
      const [, py] = toPx(0, y);
      if (py < M.top || py > M.top + plotH) continue;
      ctx.beginPath();
      ctx.moveTo(M.left, py);
      ctx.lineTo(M.left + plotW, py);
      ctx.stroke();
    }

    // axes
    ctx.strokeStyle = '#c4c8cf';
    ctx.lineWidth = 1.5;
    if (yMin <= 0 && yMax >= 0) {
      const [, ay] = toPx(0, 0);
      ctx.beginPath();
      ctx.moveTo(M.left, ay);
      ctx.lineTo(M.left + plotW, ay);
      ctx.stroke();
    }
    if (xMin <= 0 && xMax >= 0) {
      const [ax] = toPx(0, 0);
      ctx.beginPath();
      ctx.moveTo(ax, M.top);
      ctx.lineTo(ax, M.top + plotH);
      ctx.stroke();
    }

    // axis number labels
    ctx.fillStyle = '#9aa0a6';
    ctx.font = '10px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (let x = Math.ceil(xMin / step) * step; x <= xMax; x += step) {
      if (Math.abs(x) < 1e-9) continue;
      const [px] = toPx(x, 0);
      if (px < M.left || px > W - M.right) continue;
      ctx.fillText(formatNum(x), px, M.top + plotH + 4);
    }
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let y = Math.ceil(yMin / step) * step; y <= yMax; y += step) {
      if (Math.abs(y) < 1e-9) continue;
      const [, py] = toPx(0, y);
      if (py < M.top || py > M.top + plotH) continue;
      ctx.fillText(formatNum(y), M.left - 4, py);
    }

    // curve (protect against invalid expression)
    try {
      drawCurve(ctx, toPx, fn, accent, xMin, xMax);
    } catch {
      ctx.fillStyle = '#d32f2f';
      ctx.font = '13px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('表达式无效，请检查输入', W / 2, H / 2);
    }

    // hover crosshair + tooltip
    if (hover) {
      const [hx, hy] = toPx(hover.x, hover.fx);
      ctx.strokeStyle = 'rgba(0,0,0,0.25)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(hx, M.top);
      ctx.lineTo(hx, M.top + plotH);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(M.left, hy);
      ctx.lineTo(M.left + plotW, hy);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(hx, hy, 4, 0, Math.PI * 2);
      ctx.fill();
      drawTooltip(ctx, hover, W, H);
    }

    // title
    ctx.fillStyle = '#444';
    ctx.font = '13px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`f(x) = ${fn}`, M.left, 2);
  }, [fn, hiDpi, vp, hover, drawKey]);

  useEffect(() => {
    draw();
  }, [draw]);
  useEffect(() => {
    const onResize = () => draw();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [draw]);

  /* ---- actions ---- */
  const handlePlot = useCallback(() => {
    setError('');
    try {
      evaluateFunction(fn, 0); // validate expression
      const [yMin, yMax] = autoScaleY(fn, vp.xMin, vp.xMax);
      setVp((prev) => ({ ...prev, yMin, yMax }));
      setDrawKey((k) => k + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : '表达式无效');
    }
  }, [fn, vp]);

  const handleReset = useCallback(() => {
    const [yMin, yMax] = autoScaleY(fn, DEFAULT_X.xMin, DEFAULT_X.xMax);
    setVp({ ...DEFAULT_X, yMin, yMax });
    setHover(null);
    setError('');
  }, [fn]);

  const insertToken = useCallback(
    (tok: string) => {
      const el = inputRef.current;
      if (!el) {
        setExpr((p) => p + tok);
        return;
      }
      const start = el.selectionStart ?? expr.length;
      const end = el.selectionEnd ?? expr.length;
      const next = expr.slice(0, start) + tok + expr.slice(end);
      setExpr(next);
      requestAnimationFrame(() => {
        const pos = start + tok.length;
        el.focus();
        try {
          el.setSelectionRange(pos, pos);
        } catch {
          /* ignore */
        }
      });
    },
    [expr],
  );

  /* ---- interaction: zoom / pan / hover ---- */
  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const Z = 1.15;
    const dir = e.deltaY < 0 ? 1 / Z : Z;
    setVp((prev) => {
      const cx = (prev.xMin + prev.xMax) / 2;
      const cy = (prev.yMin + prev.yMax) / 2;
      const hx = ((prev.xMax - prev.xMin) / 2) * dir;
      const hy = ((prev.yMax - prev.yMin) / 2) * dir;
      return { xMin: cx - hx, xMax: cx + hx, yMin: cy - hy, yMax: cy + hy };
    });
  }, []);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      dragRef.current.active = true;
      dragRef.current.startX = e.clientX;
      dragRef.current.startY = e.clientY;
      dragRef.current.vpX = vp.xMin;
      dragRef.current.vpY = vp.yMin;
    },
    [vp],
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const W = rect.width;
      const plotW = Math.max(W - M.left - M.right, 1);
      const plotH = Math.max(CANVAS_H - M.top - M.bottom, 1);

      if (dragRef.current.active) {
        const dx = ((e.clientX - dragRef.current.startX) * (vp.xMax - vp.xMin)) / plotW;
        const dy = ((e.clientY - dragRef.current.startY) * (vp.yMax - vp.yMin)) / plotH;
        setVp((prev) => ({
          xMin: dragRef.current.vpX - dx,
          xMax: dragRef.current.vpX - dx + (prev.xMax - prev.xMin),
          yMin: dragRef.current.vpY + dy,
          yMax: dragRef.current.vpY + dy + (prev.yMax - prev.yMin),
        }));
        setHover(null);
        return;
      }

      const x = vp.xMin + ((px - M.left) / plotW) * (vp.xMax - vp.xMin);
      let fx: number;
      try {
        fx = evaluateFunction(fn, x);
      } catch {
        setHover(null);
        return;
      }
      const inPlot = px >= M.left && px <= W - M.right && py >= M.top && py <= M.top + plotH;
      const slope = Number.isFinite(fx) ? safeSlope(fn, x) : NaN;
      if (Number.isFinite(fx) && inPlot) {
        setHover({ px, py, x, fx, slope });
      } else {
        setHover(null);
      }
    },
    [vp, fn],
  );

  const onMouseUp = useCallback(() => {
    dragRef.current.active = false;
  }, []);
  const onMouseLeave = useCallback(() => {
    dragRef.current.active = false;
    setHover(null);
  }, []);

  /* ---- render ---- */
  return (
    <div className="graph-tool animate-fade-in-up">
      <div className="graph-controls">
        <label className="graph-label" htmlFor="graph-expr">
          函数表达式
        </label>
        <input
          id="graph-expr"
          ref={inputRef}
          className="graph-expr-input"
          value={expr}
          onChange={(e) => {
            setExpr(e.target.value);
            setError('');
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handlePlot();
          }}
          placeholder="例如 sin(x)、x^2、2*x+1"
          spellCheck={false}
        />
        <button className="tool-btn" type="button" onClick={handlePlot}>
          绘制
        </button>
        <button className="tool-btn secondary" type="button" onClick={handleReset}>
          重置
        </button>
      </div>

      {error && <div className="graph-error">{error}</div>}

      <div className="graph-pad">
        {PAD.map((b) => (
          <button key={b.label} type="button" className="graph-pad-btn" onClick={() => insertToken(b.insert)}>
            {b.label}
          </button>
        ))}
      </div>

      <div
        className="graph-canvas-wrap"
        role="application"
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
      >
        <canvas ref={canvasRef} className="graph-canvas" />
      </div>

      <div className="graph-hint">拖动平移 · 滚动缩放</div>
    </div>
  );
};

export default Component;
