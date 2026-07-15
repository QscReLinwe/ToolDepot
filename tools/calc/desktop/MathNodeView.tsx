import type { FC } from 'react';
import { type Cursor, childSlotIndex, isComposite, type MathNode } from './expr-tree';

/* ===== Path utilities ===== */

function pathStartsWith(path: number[], prefix: number[]): boolean {
  if (path.length < prefix.length) return false;
  for (let i = 0; i < prefix.length; i++) {
    if (path[i] !== prefix[i]) return false;
  }
  return true;
}

/* ===== Child access helpers (no deps on expr-tree internals) ===== */

function getSlotChildren(node: MathNode): MathNode[] {
  switch (node.type) {
    case 'binary':
      return [node.left, node.right];
    case 'fraction':
      return [node.num, node.den];
    case 'sum':
    case 'prod':
      return [node.lower, node.upper, node.expr];
    case 'func':
      return [node.arg];
    case 'neg':
      return [node.child];
    case 'power':
      return [node.base, node.exp];
    case 'paren':
      return [node.inner];
    case 'factorial':
      return [node.child];
    case 'percent':
      return [node.child];
    default:
      return [];
  }
}

/** Descend from `node` into its first slot child recursively until a leaf is reached. */
function descendToLeaf(node: MathNode, path: number[]): { node: MathNode; path: number[] } {
  if (node.type === 'number' || node.type === 'pi' || node.type === 'e' || node.type === 'i' || node.type === 'var') {
    return { node, path };
  }
  const children = getSlotChildren(node);
  if (children.length === 0 || children[0] === undefined) return { node, path };
  return descendToLeaf(children[0], [...path, 0]);
}

/* ===== Cursor component ===== */

const CursorSpan: FC = () => <span className="math-cursor" />;

/* ===== Leaf renderers ===== */

const NumberView: FC<{ value: string }> = ({ value }) => <span className="math-number">{value}</span>;

const NumberWithCursor: FC<{ value: string; offset: number }> = ({ value, offset }) => {
  const clamped = Math.min(offset, value.length);
  const before = value.slice(0, clamped);
  const after = value.slice(clamped);
  return (
    <span className="math-number">
      {before}
      <CursorSpan />
      {after}
    </span>
  );
};

/* ===== Composite renderer (cursor deeper in subtree) ===== */

const CompositeView: FC<{
  node: MathNode;
  cursor: Cursor | null;
  myPath: number[];
}> = ({ node, cursor, myPath }) => {
  switch (node.type) {
    /* ─── Binary ─── */
    case 'binary':
      return (
        <span className="math-binary">
          <MathNodeView node={node.left} cursor={cursor} myPath={[...myPath, 0]} />
          <span className="math-op">{node.op}</span>
          <MathNodeView node={node.right} cursor={cursor} myPath={[...myPath, 1]} />
        </span>
      );

    /* ─── Fraction ─── */
    case 'fraction':
      return (
        <span className="math-frac">
          <span className="math-frac-num">
            <MathNodeView node={node.num} cursor={cursor} myPath={[...myPath, 0]} />
          </span>
          <span className="math-frac-line" />
          <span className="math-frac-den">
            <MathNodeView node={node.den} cursor={cursor} myPath={[...myPath, 1]} />
          </span>
        </span>
      );

    /* ─── Power ─── */
    case 'power':
      return (
        <span className="math-power">
          <span className="math-power-base">
            <MathNodeView node={node.base} cursor={cursor} myPath={[...myPath, 0]} />
          </span>
          <span className="math-power-exp">
            <MathNodeView node={node.exp} cursor={cursor} myPath={[...myPath, 1]} />
          </span>
        </span>
      );

    /* ─── Sum ─── */
    case 'sum':
      return (
        <span className="math-sumprod">
          <span className="math-sumprod-symbol">Σ</span>
          <span className="math-sumprod-limits">
            <span className="math-sumprod-lower">
              <MathNodeView node={node.lower} cursor={cursor} myPath={[...myPath, 0]} />
            </span>
            <span className="math-sumprod-upper">
              <MathNodeView node={node.upper} cursor={cursor} myPath={[...myPath, 1]} />
            </span>
          </span>
          <span className="math-sumprod-expr">
            <MathNodeView node={node.expr} cursor={cursor} myPath={[...myPath, 2]} />
          </span>
        </span>
      );

    /* ─── Prod ─── */
    case 'prod':
      return (
        <span className="math-sumprod">
          <span className="math-sumprod-symbol">Π</span>
          <span className="math-sumprod-limits">
            <span className="math-sumprod-lower">
              <MathNodeView node={node.lower} cursor={cursor} myPath={[...myPath, 0]} />
            </span>
            <span className="math-sumprod-upper">
              <MathNodeView node={node.upper} cursor={cursor} myPath={[...myPath, 1]} />
            </span>
          </span>
          <span className="math-sumprod-expr">
            <MathNodeView node={node.expr} cursor={cursor} myPath={[...myPath, 2]} />
          </span>
        </span>
      );

    /* ─── Function ─── */
    case 'func':
      return (
        <span className="math-func">
          <span className="math-func-name">{node.name}(</span>
          <MathNodeView node={node.arg} cursor={cursor} myPath={[...myPath, 0]} />
          <span className="math-func-paren">)</span>
        </span>
      );

    /* ─── Negate ─── */
    case 'neg':
      return (
        <span className="math-neg">
          <span className="math-neg-sign">−</span>
          <span className="math-neg-paren">(</span>
          <MathNodeView node={node.child} cursor={cursor} myPath={[...myPath, 0]} />
          <span className="math-neg-paren">)</span>
        </span>
      );

    /* ─── Paren ─── */
    case 'paren':
      return (
        <span className="math-paren">
          <span className="math-paren-open">(</span>
          <MathNodeView node={node.inner} cursor={cursor} myPath={[...myPath, 0]} />
          <span className="math-paren-close">)</span>
        </span>
      );

    /* ─── Factorial ─── */
    case 'factorial':
      return (
        <span className="math-factorial">
          <MathNodeView node={node.child} cursor={cursor} myPath={[...myPath, 0]} />
          <span className="math-factorial-symbol">!</span>
        </span>
      );

    /* ─── Percent ─── */
    case 'percent':
      return (
        <span className="math-percent">
          <MathNodeView node={node.child} cursor={cursor} myPath={[...myPath, 0]} />
          <span className="math-percent-symbol">%</span>
        </span>
      );

    default:
      // Should never be called for leaf nodes (number/pi/e/i/var)
      return <span className="math-unknown">?</span>;
  }
};

/* ===== Main component ===== */

export interface MathNodeViewProps {
  node: MathNode;
  cursor: Cursor | null;
  myPath: number[];
}

export const MathNodeView: FC<MathNodeViewProps> = ({ node, cursor, myPath }) => {
  /* ── No cursor in this subtree → plain render ── */
  if (cursor === null || !pathStartsWith(cursor.path, myPath)) {
    // Leaf nodes that are trivial to render without cursor
    switch (node.type) {
      case 'number':
        return <NumberView value={node.value} />;
      case 'var':
        return <span className="math-var">{node.value}</span>;
      case 'pi':
        return <span className="math-const">π</span>;
      case 'e':
        return <span className="math-const">e</span>;
      case 'i':
        return <span className="math-const">i</span>;
      default:
        break; // fall through to composite render
    }
    // Composite node without cursor → render composite with null cursor
    return <CompositeView node={node} cursor={null} myPath={myPath} />;
  }

  /* ── Cursor is in this subtree ── */
  const cursorAtMe = cursor.path.length === myPath.length;

  if (!cursorAtMe) {
    // Cursor is deeper → render composite passing cursor down
    return <CompositeView node={node} cursor={cursor} myPath={myPath} />;
  }

  /* ── Cursor at this node ── */

  // Case A: composite with active slot → descend into that slot's child
  if (isComposite(node) && cursor.slot !== '') {
    const idx = childSlotIndex(node, cursor.slot);
    if (idx >= 0) {
      const children = getSlotChildren(node);
      if (children[idx] === undefined) {
        // invalid slot — fall through to composite render
        return <CompositeView node={node} cursor={null} myPath={myPath} />;
      }
      const childPath = [...myPath, idx];
      return (
        <MathNodeView
          node={children[idx]!}
          cursor={{ path: childPath, slot: '', offset: cursor.offset }}
          myPath={childPath}
        />
      );
    }
    // invalid slot — fall through to composite render
  }

  // Case B: leaf types
  if (node.type === 'number') {
    return <NumberWithCursor value={node.value} offset={cursor.offset} />;
  }
  if (node.type === 'pi') {
    return (
      <span className="math-const">
        <CursorSpan />π
      </span>
    );
  }
  if (node.type === 'e') {
    return (
      <span className="math-const">
        <CursorSpan />e
      </span>
    );
  }
  if (node.type === 'i') {
    return (
      <span className="math-const">
        <CursorSpan />i
      </span>
    );
  }
  if (node.type === 'var') {
    return (
      <span className="math-var">
        <CursorSpan />
        {node.value}
      </span>
    );
  }

  // Case C: composite at cursor with no slot (shouldn't normally happen) → descend to first leaf
  const leaf = descendToLeaf(node, myPath);
  return <MathNodeView node={leaf.node} cursor={{ path: leaf.path, slot: '', offset: 0 }} myPath={leaf.path} />;
};
