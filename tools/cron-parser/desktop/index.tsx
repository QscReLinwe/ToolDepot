import type { ToolViewProps } from '@tooldepot/types';
import type React from 'react';
import { useState } from 'react';
import type { CronParserInput, CronParserOutput } from '../core/index.js';

export const Component: React.FC<ToolViewProps<CronParserInput, CronParserOutput>> = ({
  tool,
  initialInput,
  onResult,
}) => {
  const [expression, setExpression] = useState<string>(initialInput?.expression || '*/15 * * * *');
  const [count, setCount] = useState<string>(String(initialInput?.count ?? 5));
  const [result, setResult] = useState<CronParserOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!expression.trim()) {
      setError('请输入 Cron 表达式');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const out = await tool.run({
        expression: expression.trim(),
        count: count ? Number(count) : undefined,
      });
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

  return (
    <div className="tool-card" style={{ padding: 20, maxWidth: 640 }}>
      <h3 style={{ marginBottom: 16 }}>Cron 表达式解析</h3>

      <div style={{ display: 'grid', gap: 12, maxWidth: 600 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
            Cron 表达式（分 时 日 月 星期）
            <input
              className="tool-input"
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              placeholder="*/15 * * * *"
              style={{ width: '100%', fontSize: 15, padding: '10px 12px', fontFamily: 'monospace' }}
            />
          </label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              次数
              <input
                className="tool-input"
                type="number"
                min={1}
                max={100}
                value={count}
                onChange={(e) => setCount(e.target.value)}
                style={{ width: '100%', fontSize: 15, padding: '10px 12px' }}
              />
            </label>
          </div>
        </div>

        <button
          type="button"
          className="tool-btn"
          onClick={run}
          disabled={loading || !expression.trim()}
          style={{ marginTop: 8 }}
        >
          {loading ? '解析中...' : '解析'}
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
          <div className="tool-result" style={{ marginTop: 16 }}>
            {!result.valid && (
              <div style={{ color: '#dc2626', padding: 12, background: '#fef2f2', borderRadius: 6, marginBottom: 12 }}>
                {result.error}
              </div>
            )}
            {result.valid && (
              <>
                <div style={{ padding: 12, background: '#f0fdf4', borderRadius: 6, marginBottom: 12, fontWeight: 500 }}>
                  {result.humanDescription}
                </div>
                {result.fields && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 12 }}>
                    {(['minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek'] as const).map((k) => (
                      <div key={k} style={{ padding: 8, background: '#f8fafc', borderRadius: 6, textAlign: 'center' }}>
                        <div style={{ fontSize: 11, color: '#64748b', textTransform: 'capitalize' }}>{k}</div>
                        <div style={{ fontFamily: 'monospace', fontSize: 14 }}>{result.fields?.[k] ?? ''}</div>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ fontWeight: 500, marginBottom: 6 }}>下次运行时间</div>
                <ul style={{ margin: 0, paddingLeft: 18, fontFamily: 'monospace', fontSize: 13 }}>
                  {result.nextRuns.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                  {result.nextRuns.length === 0 && <li style={{ color: '#64748b' }}>未找到即将执行的任务</li>}
                </ul>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Component;
