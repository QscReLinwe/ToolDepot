import type { ToolViewProps } from '@tooldepot/types';
import type React from 'react';
import { useState } from 'react';
import type { GraphQLBuilderInput, GraphQLBuilderOutput, GraphQLOperation, GraphQLVariable } from '../core/index.js';

const OPERATIONS: GraphQLOperation[] = ['query', 'mutation', 'subscription'];

const OP_LABELS: Record<GraphQLOperation, string> = {
  query: '查询',
  mutation: '变更',
  subscription: '订阅',
};

export const Component: React.FC<ToolViewProps<GraphQLBuilderInput, GraphQLBuilderOutput>> = ({
  tool,
  initialInput,
  onResult,
}) => {
  const [operation, setOperation] = useState<GraphQLOperation>(initialInput?.operation || 'query');
  const [name, setName] = useState<string>(initialInput?.name || '');
  const [fields, setFields] = useState<string>((initialInput?.fields || ['user.name', 'user.posts.title']).join('\n'));
  const [varsText, setVarsText] = useState<string>(
    (initialInput?.variables || []).map((v) => `${v.name}:${v.type}`).join('\n'),
  );
  const [result, setResult] = useState<GraphQLBuilderOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    const fieldList = fields
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const variables: GraphQLVariable[] = varsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((pair) => {
        const [n, t] = pair.split(':');
        return { name: (n || '').trim(), type: (t || '').trim() };
      });

    if (fieldList.length === 0) {
      setError('请至少输入一个字段');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const out = await tool.run({ operation, name: name.trim() || undefined, fields: fieldList, variables });
      if (out.ok && out.data) {
        setResult(out.data);
      } else {
        setError(out.error || '未知错误');
      }
      onResult?.(out);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    if (result?.query) navigator.clipboard?.writeText(result.query);
  };

  return (
    <div className="tool-card" style={{ padding: 20, maxWidth: 640 }}>
      <h3 style={{ marginBottom: 16 }}>GraphQL 构建器</h3>

      <div style={{ display: 'grid', gap: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label htmlFor="gb-operation" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              操作
            </label>
            <select
              id="gb-operation"
              className="tool-select"
              value={operation}
              onChange={(e) => setOperation(e.target.value as GraphQLOperation)}
              style={{ width: '100%', fontSize: 15, padding: '10px 12px' }}
            >
              {OPERATIONS.map((o) => (
                <option key={o} value={o}>
                  {OP_LABELS[o]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="gb-name" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              名称（可选）
            </label>
            <input
              id="gb-name"
              className="tool-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="MyQuery"
              style={{ width: '100%', fontSize: 15, padding: '10px 12px' }}
            />
          </div>
        </div>

        <div>
          <label htmlFor="gb-fields" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
            字段（每行一个，使用点号表示嵌套）{' '}
          </label>
          <textarea
            id="gb-fields"
            className="tool-input"
            value={fields}
            onChange={(e) => setFields(e.target.value)}
            rows={5}
            style={{ width: '100%', fontSize: 14, padding: '10px 12px', fontFamily: 'monospace', resize: 'vertical' }}
          />
        </div>

        <div>
          <label htmlFor="gb-vars" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
            变量（每行一个，格式 name:type）
          </label>
          <textarea
            id="gb-vars"
            className="tool-input"
            value={varsText}
            onChange={(e) => setVarsText(e.target.value)}
            rows={3}
            placeholder="id: ID!\ninput: UserInput"
            style={{ width: '100%', fontSize: 14, padding: '10px 12px', fontFamily: 'monospace', resize: 'vertical' }}
          />
        </div>

        <button type="button" className="tool-btn" onClick={run} disabled={loading} style={{ marginTop: 4 }}>
          {loading ? '构建中...' : '构建'}
        </button>

        {error && (
          <div
            className="tool-error"
            style={{ color: '#dc2626', marginTop: 12, padding: 12, background: '#fef2f2', borderRadius: 6 }}
          >
            {error}
          </div>
        )}

        {result && (
          <div className="tool-result" style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontWeight: 500 }}>生成的查询</span>
              <button type="button" className="tool-btn" style={{ padding: '4px 10px', fontSize: 13 }} onClick={copy}>
                复制
              </button>
            </div>
            <pre
              style={{
                margin: 0,
                padding: 12,
                background: '#f8fafc',
                borderRadius: 6,
                fontFamily: 'monospace',
                fontSize: 13,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {result.query}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default Component;
