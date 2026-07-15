import type { ToolViewProps } from '@tooldepot/types';
import type React from 'react';
import { useState } from 'react';
import type { DedupSortInput, DedupSortOrder, DedupSortOutput } from '../core/index.js';

export const Component: React.FC<ToolViewProps<DedupSortInput, DedupSortOutput>> = ({
  tool,
  initialInput,
  onResult,
}) => {
  const [text, setText] = useState<string>(initialInput?.text ?? '');
  const [sort, setSort] = useState<DedupSortOrder>(initialInput?.sort ?? 'none');
  const [unique, setUnique] = useState<boolean>(initialInput?.unique ?? true);
  const [ignoreCase, setIgnoreCase] = useState<boolean>(initialInput?.ignoreCase ?? true);
  const [removeBlank, setRemoveBlank] = useState<boolean>(initialInput?.removeBlank ?? true);
  const [numeric, setNumeric] = useState<boolean>(initialInput?.numeric ?? false);
  const [result, setResult] = useState<DedupSortOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setError(null);
    const out = await tool.run({
      text,
      sort,
      unique,
      ignoreCase,
      removeBlank,
      numeric,
    });
    if (out.ok && out.data) {
      setResult(out.data);
    } else {
      setError(out.error ?? 'Unknown error');
      setResult(null);
    }
    onResult?.(out);
  };

  const checkbox = (label: string, checked: boolean, onChange: (v: boolean) => void) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );

  return (
    <div className="tool-card" style={{ padding: 20, maxWidth: 600 }}>
      <h3 style={{ marginBottom: 16 }}>去重与排序</h3>

      <div style={{ display: 'grid', gap: 12, maxWidth: 500 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
            文本（每行一项）
            <textarea
              className="tool-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              placeholder={'apple\nbanana\napple\ncherry'}
              style={{ width: '100%', fontSize: 15, padding: '10px 12px', resize: 'vertical' }}
            />
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              排序
              <select
                className="tool-select"
                value={sort}
                onChange={(e) => setSort(e.target.value as DedupSortOrder)}
                style={{ width: '100%', fontSize: 15, padding: '10px 12px' }}
              >
                <option value="none">无</option>
                <option value="asc">升序</option>
                <option value="desc">降序</option>
              </select>
            </label>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, paddingBottom: 10 }}>
            <input type="checkbox" checked={numeric} onChange={(e) => setNumeric(e.target.checked)} />
            按数值
          </label>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          {checkbox('去重', unique, setUnique)}
          {checkbox('忽略大小写', ignoreCase, setIgnoreCase)}
          {checkbox('移除空行', removeBlank, setRemoveBlank)}
        </div>

        <button type="button" className="tool-btn" onClick={run} style={{ marginTop: 4 }}>
          处理
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
          <div className="tool-result" style={{ marginTop: 16, padding: 12, background: '#f8fafc', borderRadius: 6 }}>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>
              {result.count} 行 · 已移除 {result.removed} 行
            </div>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 14 }}>
              {result.lines.join('\n')}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default Component;
