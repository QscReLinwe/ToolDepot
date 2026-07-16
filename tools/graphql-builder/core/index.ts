import type { Tool, ToolOutput } from '@tooldepot/types';

export type GraphQLOperation = 'query' | 'mutation' | 'subscription';

export interface GraphQLVariable {
  name: string;
  type: string;
}

export interface GraphQLBuilderInput {
  operation: GraphQLOperation;
  name?: string;
  /** Field paths using dot-notation for nesting, e.g. "user.name", "user.posts.title". */
  fields: string[];
  variables?: GraphQLVariable[];
}

export interface GraphQLBuilderOutput {
  query: string;
}

interface SelectionNode {
  children: Map<string, SelectionNode>;
}

const NAME_RE = /^[A-Za-z_][A-Za-z0-9_]*$/;

function buildTree(fields: string[]): Map<string, SelectionNode> {
  const root = new Map<string, SelectionNode>();
  for (const raw of fields) {
    const parts = raw
      .split('.')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    if (parts.length === 0) continue;
    for (const part of parts) {
      if (!NAME_RE.test(part)) {
        throw new Error(`Invalid field name: "${part}" in "${raw}"`);
      }
    }
    let level = root;
    for (const part of parts) {
      let node = level.get(part);
      if (!node) {
        node = { children: new Map() };
        level.set(part, node);
      }
      level = node.children;
    }
  }
  return root;
}

function renderSelection(tree: Map<string, SelectionNode>, indent: string): string[] {
  const lines: string[] = [];
  for (const [key, node] of tree) {
    if (node.children.size > 0) {
      lines.push(`${indent}${key} {`);
      lines.push(...renderSelection(node.children, `${indent}  `));
      lines.push(`${indent}}`);
    } else {
      lines.push(`${indent}${key}`);
    }
  }
  return lines;
}

export const tool: Tool<GraphQLBuilderInput, GraphQLBuilderOutput> = {
  id: 'graphql-builder',
  name: 'GraphQL 查询构建器',
  description: '可视化构建与检查 GraphQL 查询。',
  category: 'dev',
  async run(input: GraphQLBuilderInput): Promise<ToolOutput<GraphQLBuilderOutput>> {
    const operation = input?.operation;
    if (operation !== 'query' && operation !== 'mutation' && operation !== 'subscription') {
      return { ok: false, error: 'operation must be one of: query, mutation, subscription' };
    }
    const fields = Array.isArray(input?.fields) ? input.fields : [];
    if (fields.length === 0) {
      return { ok: false, error: 'At least one field is required' };
    }
    const name = input?.name?.trim();
    const variables = Array.isArray(input?.variables) ? input.variables : [];

    for (const v of variables) {
      if (!v || !NAME_RE.test(v.name) || !NAME_RE.test(v.type)) {
        return { ok: false, error: `Invalid variable definition: ${JSON.stringify(v)}` };
      }
    }

    try {
      const tree = buildTree(fields);
      const selectionLines = renderSelection(tree, '');
      const selectionBlock = selectionLines.map((l) => `  ${l}`).join('\n');

      const varString = variables.length > 0 ? `(${variables.map((v) => `$${v.name}: ${v.type}`).join(', ')})` : '';
      const header = `${operation}${name ? ` ${name}` : ''}${varString}`;
      const query = `${header} {\n${selectionBlock}\n}`;

      return { ok: true, data: { query }, mimeType: 'text/plain' };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  },
};

export default tool;
