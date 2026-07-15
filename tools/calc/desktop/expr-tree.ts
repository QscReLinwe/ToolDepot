// Math expression tree: immutable data structure, cursor model, and pure
// operations for building / navigating / serializing a Natural-Display-style
// calculator expression. No external dependencies; all operations are pure.

/* ===== ID generation ===== */

let counter = 0;
function generateId(): string {
  return 'n' + counter++;
}

function numberNode(value: string): MathNode {
  return { type: 'number', id: generateId(), value };
}

function makeConstant(constant: 'π' | 'e' | 'i'): MathNode {
  if (constant === 'π') return { type: 'pi', id: generateId() };
  if (constant === 'e') return { type: 'e', id: generateId() };
  return { type: 'i', id: generateId() };
}

/* ===== Math Node Types (discriminated union) ===== */

export type MathNode =
  | { type: 'number'; id: string; value: string }
  | { type: 'binary'; id: string; op: '+' | '-' | '×' | '÷' | '='; left: MathNode; right: MathNode }
  | { type: 'fraction'; id: string; num: MathNode; den: MathNode }
  | { type: 'sum'; id: string; var: string; lower: MathNode; upper: MathNode; expr: MathNode }
  | { type: 'prod'; id: string; var: string; lower: MathNode; upper: MathNode; expr: MathNode }
  | { type: 'func'; id: string; name: string; arg: MathNode }
  | { type: 'neg'; id: string; child: MathNode }
  | { type: 'power'; id: string; base: MathNode; exp: MathNode }
  | { type: 'paren'; id: string; inner: MathNode }
  | { type: 'pi'; id: string }
  | { type: 'e'; id: string }
  | { type: 'i'; id: string }
  | { type: 'factorial'; id: string; child: MathNode }
  | { type: 'percent'; id: string; child: MathNode }
  | { type: 'var'; id: string; value: string };

/* ===== Cursor ===== */

export interface Cursor {
  path: number[]; // indices from root to focused node
  slot: string; // which child slot: '' (default), 'left'/'right' for binary, 'num'/'den' for fraction, 'lower'/'upper'/'expr' for sum/prod, 'arg' for func/neg/paren/power/factorial/percent
  offset: number; // character offset in number node
}

/* ===== Child access helpers ===== */

export function isComposite(node: MathNode): boolean {
  return slotCount(node) > 0;
}

function slotCount(node: MathNode): number {
  switch (node.type) {
    case 'binary': return 2;
    case 'fraction': return 2;
    case 'sum':
    case 'prod': return 3;
    case 'func': return 1;
    case 'neg': return 1;
    case 'power': return 2;
    case 'paren': return 1;
    case 'factorial': return 1;
    case 'percent': return 1;
    case 'number':
    case 'pi':
    case 'e':
    case 'i':
    case 'var': return 0;
    default: return assertNever(node);
  }
}

export function childSlotIndex(node: MathNode, slot: string): number {
  switch (node.type) {
    case 'binary': return slot === 'left' ? 0 : 1;
    case 'fraction': return slot === 'num' ? 0 : 1;
    case 'sum':
    case 'prod': return slot === 'lower' ? 0 : slot === 'upper' ? 1 : 2;
    case 'func': return 0;
    case 'neg': return 0;
    case 'power': return slot === 'base' ? 0 : 1;
    case 'paren': return 0;
    case 'factorial': return 0;
    case 'percent': return 0;
    case 'number':
    case 'pi':
    case 'e':
    case 'i':
    case 'var': return -1;
    default: return assertNever(node);
  }
}

function slotNameForIndex(node: MathNode, idx: number): string {
  switch (node.type) {
    case 'binary': return idx === 0 ? 'left' : 'right';
    case 'fraction': return idx === 0 ? 'num' : 'den';
    case 'sum':
    case 'prod': return idx === 0 ? 'lower' : idx === 1 ? 'upper' : 'expr';
    case 'func': return 'arg';
    case 'neg': return 'child';
    case 'power': return idx === 0 ? 'base' : 'exp';
    case 'paren': return 'inner';
    case 'factorial': return 'child';
    case 'percent': return 'child';
    case 'number':
    case 'pi':
    case 'e':
    case 'i':
    case 'var': return '';
    default: return assertNever(node);
  }
}

function getChild(node: MathNode, idx: number): MathNode {
  switch (node.type) {
    case 'binary': return idx === 0 ? node.left : node.right;
    case 'fraction': return idx === 0 ? node.num : node.den;
    case 'sum':
    case 'prod': return idx === 0 ? node.lower : idx === 1 ? node.upper : node.expr;
    case 'func': return node.arg;
    case 'neg': return node.child;
    case 'power': return idx === 0 ? node.base : node.exp;
    case 'paren': return node.inner;
    case 'factorial': return node.child;
    case 'percent': return node.child;
    case 'number':
    case 'pi':
    case 'e':
    case 'i':
    case 'var': throw new Error('Leaf node has no children');
    default: return assertNever(node);
  }
}

function replaceChild(node: MathNode, idx: number, child: MathNode): MathNode {
  switch (node.type) {
    case 'binary': return idx === 0 ? { ...node, left: child } : { ...node, right: child };
    case 'fraction': return idx === 0 ? { ...node, num: child } : { ...node, den: child };
    case 'sum':
    case 'prod':
      return idx === 0 ? { ...node, lower: child } : idx === 1 ? { ...node, upper: child } : { ...node, expr: child };
    case 'func': return { ...node, arg: child };
    case 'neg': return { ...node, child };
    case 'power': return idx === 0 ? { ...node, base: child } : { ...node, exp: child };
    case 'paren': return { ...node, inner: child };
    case 'factorial': return { ...node, child };
    case 'percent': return { ...node, child };
    case 'number':
    case 'pi':
    case 'e':
    case 'i':
    case 'var': throw new Error('Cannot replace child of leaf node');
    default: return assertNever(node);
  }
}

function assertNever(x: never): never {
  throw new Error('Unhandled node type: ' + JSON.stringify(x));
}

/* ===== Tree access ===== */

export function getNodeAtPath(tree: MathNode, path: number[]): MathNode {
  let node = tree;
  for (const idx of path) {
    node = getChild(node, idx);
  }
  return node;
}

export function replaceNodeAtPath(tree: MathNode, path: number[], newNode: MathNode): MathNode {
  if (path.length === 0) return newNode;
  const idx = path[0]!;
  const rest = path.slice(1);
  const child = replaceNodeAtPath(getChild(tree, idx), rest, newNode);
  return replaceChild(tree, idx, child);
}

/** The node the cursor is "inside" (descends into the active child slot for composites). */
export function getCursorNode(tree: MathNode, cursor: Cursor): MathNode {
  const node = getNodeAtPath(tree, cursor.path);
  if (isComposite(node) && cursor.slot !== '') {
    const idx = childSlotIndex(node, cursor.slot);
    if (idx >= 0) return getChild(node, idx);
  }
  return node;
}

/** Effective editing target: the node + path where text/value edits apply. */
function getEditTarget(tree: MathNode, cursor: Cursor): { node: MathNode; path: number[] } {
  const node = getNodeAtPath(tree, cursor.path);
  if (isComposite(node) && cursor.slot !== '') {
    const idx = childSlotIndex(node, cursor.slot);
    if (idx >= 0) {
      return { node: getChild(node, idx), path: [...cursor.path, idx] };
    }
  }
  return { node, path: cursor.path };
}

/* ===== Navigation helpers ===== */

function descendFirst(node: MathNode, path: number[]): Cursor {
  if (node.type === 'number') return { path, slot: '', offset: 0 };
  if (node.type === 'pi' || node.type === 'e' || node.type === 'i' || node.type === 'var') return { path, slot: '', offset: 0 };
  const idx = 0;
  return descendFirst(getChild(node, idx), [...path, idx]);
}

function descendLast(node: MathNode, path: number[]): Cursor {
  if (node.type === 'number') return { path, slot: '', offset: node.value.length };
  if (node.type === 'pi' || node.type === 'e' || node.type === 'i' || node.type === 'var') return { path, slot: '', offset: 0 };
  const idx = slotCount(node) - 1;
  return descendLast(getChild(node, idx), [...path, idx]);
}

function exitLeft(tree: MathNode, path: number[]): Cursor {
  const parentPath = path.slice(0, -1);
  const parent = getNodeAtPath(tree, parentPath);
  const idx = path[path.length - 1]!;
  if (idx > 0) {
    const sibPath = [...parentPath, idx - 1];
    return descendLast(getChild(parent, idx - 1), sibPath);
  }
  return { path: parentPath, slot: slotNameForIndex(parent, 0), offset: 0 };
}

function exitRight(tree: MathNode, path: number[]): Cursor {
  const parentPath = path.slice(0, -1);
  const parent = getNodeAtPath(tree, parentPath);
  const idx = path[path.length - 1]!;
  const count = slotCount(parent);
  if (idx < count - 1) {
    const sibPath = [...parentPath, idx + 1];
    return descendFirst(getChild(parent, idx + 1), sibPath);
  }
  return { path: parentPath, slot: slotNameForIndex(parent, idx), offset: 0 };
}

function upToParent(tree: MathNode, path: number[]): Cursor {
  const parentPath = path.slice(0, -1);
  const parent = getNodeAtPath(tree, parentPath);
  const idx = path[path.length - 1]!;
  return { path: parentPath, slot: slotNameForIndex(parent, idx), offset: 0 };
}

/* ===== Navigation (all pure: (tree, cursor) => Cursor) ===== */

export function moveUp(tree: MathNode, cursor: Cursor): Cursor {
  const node = getNodeAtPath(tree, cursor.path);
  // Case 1: already at a composite node with an active slot -> cycle within it
  if (isComposite(node) && cursor.slot !== '') {
    if (node.type === 'fraction' && cursor.slot === 'den') {
      return { path: cursor.path, slot: 'num', offset: 0 };
    }
    if (node.type === 'power' && cursor.slot === 'exp') {
      return { path: cursor.path, slot: 'base', offset: 0 };
    }
    if (node.type === 'sum' || node.type === 'prod') {
      if (cursor.slot === 'expr') return { path: cursor.path, slot: 'upper', offset: 0 };
      if (cursor.slot === 'upper') return { path: cursor.path, slot: 'lower', offset: 0 };
      // 'lower' -> fall through to go up to parent
    }
    if (cursor.path.length === 0) return cursor;
    return upToParent(tree, cursor.path);
  }
  // Case 2: at a number/leaf (or composite with no slot) -> go up to parent,
  // applying one cycling step if the parent is a fraction/sum/prod.
  if (cursor.path.length === 0) return cursor;
  const parentPath = cursor.path.slice(0, -1);
  const parent = getNodeAtPath(tree, parentPath);
  const idx = cursor.path[cursor.path.length - 1]!;
  const slot = slotNameForIndex(parent, idx);
  if (parent.type === 'fraction' && slot === 'den') {
    return { path: parentPath, slot: 'num', offset: 0 };
  }
  if (parent.type === 'sum' || parent.type === 'prod') {
    if (slot === 'expr') return { path: parentPath, slot: 'upper', offset: 0 };
    if (slot === 'upper') return { path: parentPath, slot: 'lower', offset: 0 };
    // 'lower' -> go up to parent of the sum/prod
    if (parentPath.length === 0) return { path: parentPath, slot: 'lower', offset: 0 };
    return upToParent(tree, parentPath);
  }
  if (parent.type === 'power') {
    if (slot === 'exp') return { path: parentPath, slot: 'base', offset: 0 };
    // 'base' -> go up to parent of the power
    if (parentPath.length === 0) return { path: parentPath, slot: 'base', offset: 0 };
    return upToParent(tree, parentPath);
  }
  return { path: parentPath, slot, offset: 0 };
}

export function moveDown(tree: MathNode, cursor: Cursor): Cursor {
  const node = getNodeAtPath(tree, cursor.path);

  // Case 1: at a composite with an active slot — cycle to next slot or descend
  if (isComposite(node) && cursor.slot !== '') {
    // fraction: num → den
    if (node.type === 'fraction' && cursor.slot === 'num') {
      return { path: cursor.path, slot: 'den', offset: 0 };
    }
    // power: base → exp
    if (node.type === 'power' && cursor.slot === 'base') {
      return { path: cursor.path, slot: 'exp', offset: 0 };
    }
    // sum/prod: lower → upper → expr
    if ((node.type === 'sum' || node.type === 'prod') && cursor.slot === 'lower') {
      return { path: cursor.path, slot: 'upper', offset: 0 };
    }
    if ((node.type === 'sum' || node.type === 'prod') && cursor.slot === 'upper') {
      return { path: cursor.path, slot: 'expr', offset: 0 };
    }
    // Otherwise descend into the active slot's child
    const sidx = childSlotIndex(node, cursor.slot);
    if (sidx >= 0) return descendFirst(getChild(node, sidx), [...cursor.path, sidx]);
    // fallback
    const defIdx = 0;
    return descendFirst(getChild(node, defIdx), [...cursor.path, defIdx]);
  }

  // Case 2: at a leaf (or composite with no slot) — check parent for vertical slot move
  if (cursor.path.length === 0) return cursor;
  const parentPath = cursor.path.slice(0, -1);
  const parent = getNodeAtPath(tree, parentPath);
  const idx = cursor.path[cursor.path.length - 1]!;
  const slot = slotNameForIndex(parent, idx);

  if (parent.type === 'fraction') {
    if (slot === 'num') return { path: parentPath, slot: 'den', offset: 0 };
    return cursor;
  }
  if (parent.type === 'power' && slot === 'base') {
    return { path: parentPath, slot: 'exp', offset: 0 };
  }
  if (parent.type === 'sum' || parent.type === 'prod') {
    if (slot === 'lower') return { path: parentPath, slot: 'upper', offset: 0 };
    if (slot === 'upper') return { path: parentPath, slot: 'expr', offset: 0 };
    return cursor;
  }

  return cursor;
}

export function moveLeft(tree: MathNode, cursor: Cursor): Cursor {
  const node = getNodeAtPath(tree, cursor.path);
  if (node.type === 'number' && cursor.offset > 0) {
    return { path: cursor.path, slot: '', offset: cursor.offset - 1 };
  }
  if (isComposite(node) && cursor.slot !== '') {
    const pos = childSlotIndex(node, cursor.slot);
    if (pos > 0) {
      const idx = pos - 1;
      return descendLast(getChild(node, idx), [...cursor.path, idx]);
    }
    if (cursor.path.length <= 1) return cursor;
    return exitLeft(tree, cursor.path);
  }
  if (cursor.path.length === 0) return cursor;
  return exitLeft(tree, cursor.path);
}

export function moveRight(tree: MathNode, cursor: Cursor): Cursor {
  const node = getNodeAtPath(tree, cursor.path);
  if (node.type === 'number' && cursor.offset < node.value.length) {
    return { path: cursor.path, slot: '', offset: cursor.offset + 1 };
  }
  if (isComposite(node) && cursor.slot !== '') {
    const pos = childSlotIndex(node, cursor.slot);
    const count = slotCount(node);
    if (pos < count - 1) {
      const idx = pos + 1;
      return descendFirst(getChild(node, idx), [...cursor.path, idx]);
    }
    if (cursor.path.length <= 1) return cursor;
    return exitRight(tree, cursor.path);
  }
  if (cursor.path.length === 0) {
    if (isComposite(node)) return descendFirst(node, cursor.path);
    return cursor;
  }
  return exitRight(tree, cursor.path);
}

/* ===== Factory ===== */

export function createEmptyTree(): MathNode {
  return { type: 'number', id: generateId(), value: '0' };
}

/* ===== Editing (all pure: (tree, cursor, ...) => { tree: MathNode; cursor: Cursor }) ===== */

export function insertDigit(tree: MathNode, cursor: Cursor, digit: string): { tree: MathNode; cursor: Cursor } {
  const { node, path } = getEditTarget(tree, cursor);
  if (node.type !== 'number') return { tree, cursor };

  let value: string;
  let newOffset: number;

  // Replace placeholder '0' (sole character) with the typed digit
  if (node.value === '0' && node.value.length === 1) {
    value = digit;
    newOffset = 1;
  } else {
    const before = node.value.slice(0, cursor.offset);
    const after = node.value.slice(cursor.offset);
    value = before + digit + after;
    newOffset = cursor.offset + 1;
  }

  const newNode: MathNode = { ...node, value };
  return {
    tree: replaceNodeAtPath(tree, path, newNode),
    cursor: { path, slot: '', offset: newOffset },
  };
}

export function insertDecimal(tree: MathNode, cursor: Cursor): { tree: MathNode; cursor: Cursor } {
  const { node, path } = getEditTarget(tree, cursor);
  if (node.type !== 'number') return { tree, cursor };
  const before = node.value.slice(0, cursor.offset);
  const after = node.value.slice(cursor.offset);
  const value = node.value.includes('.') ? node.value : before + '.' + after;
  const newNode: MathNode = { ...node, value };
  return {
    tree: replaceNodeAtPath(tree, path, newNode),
    cursor: { path, slot: '', offset: cursor.offset + 1 },
  };
}

export function insertOperator(tree: MathNode, cursor: Cursor, op: '+' | '-' | '×' | '÷' | '='): { tree: MathNode; cursor: Cursor } {
  const { node, path } = getEditTarget(tree, cursor);
  const binary: MathNode = { type: 'binary', id: generateId(), op, left: node, right: numberNode('0') };
  const newTree = replaceNodeAtPath(tree, path, binary);
  return { tree: newTree, cursor: { path: [...path, 1], slot: '', offset: 0 } };
}

export function insertPower(tree: MathNode, cursor: Cursor): { tree: MathNode; cursor: Cursor } {
  const { node, path } = getEditTarget(tree, cursor);
  const power: MathNode = { type: 'power', id: generateId(), base: node, exp: numberNode('0') };
  const newTree = replaceNodeAtPath(tree, path, power);
  return { tree: newTree, cursor: { path: [...path, 1], slot: '', offset: 0 } };
}

export function insertFunction(tree: MathNode, cursor: Cursor, name: string): { tree: MathNode; cursor: Cursor } {
  const { node, path } = getEditTarget(tree, cursor);
  const func: MathNode = { type: 'func', id: generateId(), name, arg: node };
  const newTree = replaceNodeAtPath(tree, path, func);
  return { tree: newTree, cursor: { path: [...path, 0], slot: '', offset: 0 } };
}

export function insertFraction(tree: MathNode, cursor: Cursor): { tree: MathNode; cursor: Cursor } {
  const { node, path } = getEditTarget(tree, cursor);
  // If the current node is already a number (or just '0'), move it to num slot
  // and put cursor in the numerator so user can type on top.
  const frac: MathNode = { type: 'fraction', id: generateId(), num: node, den: numberNode('0') };
  const newTree = replaceNodeAtPath(tree, path, frac);
  // Cursor goes to NUMERATOR slot (path: [...path, 0] with slot 'num')
  return { tree: newTree, cursor: { path: [...path, 0], slot: 'num', offset: 0 } };
}

export function insertNegate(tree: MathNode, cursor: Cursor): { tree: MathNode; cursor: Cursor } {
  const { node, path } = getEditTarget(tree, cursor);
  const neg: MathNode = { type: 'neg', id: generateId(), child: node };
  const newTree = replaceNodeAtPath(tree, path, neg);
  return { tree: newTree, cursor: { path: [...path, 0], slot: '', offset: 0 } };
}

export function insertPercent(tree: MathNode, cursor: Cursor): { tree: MathNode; cursor: Cursor } {
  const { node, path } = getEditTarget(tree, cursor);
  const pct: MathNode = { type: 'percent', id: generateId(), child: node };
  const newTree = replaceNodeAtPath(tree, path, pct);
  return { tree: newTree, cursor: { path: [...path, 0], slot: '', offset: 0 } };
}

export function insertFactorial(tree: MathNode, cursor: Cursor): { tree: MathNode; cursor: Cursor } {
  const { node, path } = getEditTarget(tree, cursor);
  const fact: MathNode = { type: 'factorial', id: generateId(), child: node };
  const newTree = replaceNodeAtPath(tree, path, fact);
  return { tree: newTree, cursor: { path: [...path, 0], slot: '', offset: 0 } };
}

export function insertConstant(tree: MathNode, cursor: Cursor, constant: 'π' | 'e' | 'i'): { tree: MathNode; cursor: Cursor } {
  const { node, path } = getEditTarget(tree, cursor);
  if (node.type !== 'number') return { tree, cursor };
  const constNode = makeConstant(constant);
  return { tree: replaceNodeAtPath(tree, path, constNode), cursor: { path, slot: '', offset: 0 } };
}

export function insertVar(tree: MathNode, cursor: Cursor, letter: string): { tree: MathNode; cursor: Cursor } {
  const { node, path } = getEditTarget(tree, cursor);
  if (node.type !== 'number' && node.type !== 'var') return { tree, cursor };
  const vn: MathNode = { type: 'var', id: generateId(), value: letter };
  return {
    tree: replaceNodeAtPath(tree, path, vn),
    cursor: { path, slot: '', offset: 0 },
  };
}

export function insertParen(tree: MathNode, cursor: Cursor): { tree: MathNode; cursor: Cursor } {
  const { node, path } = getEditTarget(tree, cursor);
  const paren: MathNode = { type: 'paren', id: generateId(), inner: node };
  const newTree = replaceNodeAtPath(tree, path, paren);
  return { tree: newTree, cursor: { path: [...path, 0], slot: '', offset: 0 } };
}

export function insertSum(tree: MathNode, cursor: Cursor): { tree: MathNode; cursor: Cursor } {
  const { node, path } = getEditTarget(tree, cursor);
  const sum: MathNode = {
    type: 'sum',
    id: generateId(),
    var: 'k',
    lower: numberNode('0'),
    upper: numberNode('0'),
    expr: node,
  };
  const newTree = replaceNodeAtPath(tree, path, sum);
  return { tree: newTree, cursor: { path: [...path, 2], slot: '', offset: 0 } };
}

export function insertProd(tree: MathNode, cursor: Cursor): { tree: MathNode; cursor: Cursor } {
  const { node, path } = getEditTarget(tree, cursor);
  const prod: MathNode = {
    type: 'prod',
    id: generateId(),
    var: 'k',
    lower: numberNode('0'),
    upper: numberNode('0'),
    expr: node,
  };
  const newTree = replaceNodeAtPath(tree, path, prod);
  return { tree: newTree, cursor: { path: [...path, 2], slot: '', offset: 0 } };
}

export function backspace(tree: MathNode, cursor: Cursor): { tree: MathNode; cursor: Cursor } {
  const node = getNodeAtPath(tree, cursor.path);
  if (node.type === 'number') {
    if (cursor.offset > 0) {
      const value = node.value.slice(0, cursor.offset - 1) + node.value.slice(cursor.offset);
      const finalValue = value.length === 0 ? '0' : value;
      const newNode: MathNode = { ...node, value: finalValue };
      const newOffset = finalValue === '0' ? 0 : cursor.offset - 1;
      return {
        tree: replaceNodeAtPath(tree, cursor.path, newNode),
        cursor: { path: cursor.path, slot: '', offset: newOffset },
      };
    }
    // offset === 0: remove this number node from its parent
    if (cursor.path.length === 0) {
      const newNode: MathNode = { ...node, value: '0' };
      return { tree: replaceNodeAtPath(tree, cursor.path, newNode), cursor: { path: cursor.path, slot: '', offset: 0 } };
    }
    const parentPath = cursor.path.slice(0, -1);
    const parent = getNodeAtPath(tree, parentPath);
    const idx = cursor.path[cursor.path.length - 1]!;
    const slot = slotNameForIndex(parent, idx);
    return { tree: replaceNodeAtPath(tree, cursor.path, numberNode('0')), cursor: { path: parentPath, slot, offset: 0 } };
  }
  if (isComposite(node) && cursor.slot !== '') {
    const idx = childSlotIndex(node, cursor.slot);
    if (idx >= 0) {
      const childPath = [...cursor.path, idx];
      return {
        tree: replaceNodeAtPath(tree, childPath, numberNode('0')),
        cursor: { path: cursor.path, slot: cursor.slot, offset: 0 },
      };
    }
  }
  // leaf constant or composite with no slot: remove from parent
  if (cursor.path.length === 0) return { tree, cursor };
  const parentPath = cursor.path.slice(0, -1);
  const parent = getNodeAtPath(tree, parentPath);
  const idx = cursor.path[cursor.path.length - 1]!;
  const slot = slotNameForIndex(parent, idx);
  return { tree: replaceNodeAtPath(tree, cursor.path, numberNode('0')), cursor: { path: parentPath, slot, offset: 0 } };
}

export function deleteForward(tree: MathNode, cursor: Cursor): { tree: MathNode; cursor: Cursor } {
  const node = getNodeAtPath(tree, cursor.path);
  if (node.type === 'number') {
    const value = node.value.slice(0, cursor.offset) + node.value.slice(cursor.offset + 1);
    const finalValue = value.length === 0 ? '0' : value;
    const newNode: MathNode = { ...node, value: finalValue };
    const newOffset = Math.min(cursor.offset, finalValue.length);
    return {
      tree: replaceNodeAtPath(tree, cursor.path, newNode),
      cursor: { path: cursor.path, slot: '', offset: newOffset },
    };
  }
  // For composite or constant leaves, fall back to backspace semantics
  return backspace(tree, cursor);
}

export function moveHome(tree: MathNode, cursor: Cursor): Cursor {
  void cursor;
  return descendFirst(tree, []);
}

export function moveEnd(tree: MathNode, cursor: Cursor): Cursor {
  void cursor;
  return descendLast(tree, []);
}

export function clearTree(): MathNode {
  return createEmptyTree();
}

/* ===== Serialization → evaluator string ===== */

function opToStr(op: '+' | '-' | '×' | '÷' | '='): string {
  if (op === '×') return '*';
  if (op === '÷') return '/';
  return op; // '+', '-', or '='
}

export function serializeTree(tree: MathNode): string {
  switch (tree.type) {
    case 'number': return tree.value;
    case 'binary':
      if (tree.op === '=') return `${serializeTree(tree.left)}=${serializeTree(tree.right)}`;
      return `(${serializeTree(tree.left)}${opToStr(tree.op)}${serializeTree(tree.right)})`;
    case 'fraction': return `(${serializeTree(tree.num)}/${serializeTree(tree.den)})`;
    case 'sum': return `Σ(${tree.var},${serializeTree(tree.lower)},${serializeTree(tree.upper)},${serializeTree(tree.expr)})`;
    case 'prod': return `∏(${tree.var},${serializeTree(tree.lower)},${serializeTree(tree.upper)},${serializeTree(tree.expr)})`;
    case 'func': return `${tree.name}(${serializeTree(tree.arg)})`;
    case 'neg': return `(-${serializeTree(tree.child)})`;
    case 'power': return `(${serializeTree(tree.base)}^${serializeTree(tree.exp)})`;
    case 'paren': return `(${serializeTree(tree.inner)})`;
    case 'pi': return 'π';
    case 'e': return 'e';
    case 'i': return 'i';
    case 'factorial': return `(${serializeTree(tree.child)}!)`;
    case 'percent': return `(${serializeTree(tree.child)}%)`;
    case 'var': return tree.value;
    default: return assertNever(tree);
  }
}
