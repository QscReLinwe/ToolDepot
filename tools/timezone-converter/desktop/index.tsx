import type { ToolViewProps } from '@tooldepot/types';
import type React from 'react';
import { useState } from 'react';
import type { TimezoneConverterInput, TimezoneConverterOutput } from '../core/index.js';

const COMMON_TIMEZONES: { value: string; label: string }[] = [
  { value: 'UTC', label: 'UTC（协调世界时）' },
  { value: 'Asia/Shanghai', label: '中国标准时间 (Asia/Shanghai)' },
  { value: 'Asia/Hong_Kong', label: '香港时间 (Asia/Hong_Kong)' },
  { value: 'Asia/Taipei', label: '台湾时间 (Asia/Taipei)' },
  { value: 'Asia/Singapore', label: '新加坡时间 (Asia/Singapore)' },
  { value: 'Asia/Tokyo', label: '日本时间 (Asia/Tokyo)' },
  { value: 'Asia/Seoul', label: '韩国时间 (Asia/Seoul)' },
  { value: 'Asia/Kolkata', label: '印度时间 (Asia/Kolkata)' },
  { value: 'Asia/Dubai', label: '迪拜时间 (Asia/Dubai)' },
  { value: 'Asia/Bangkok', label: '泰国时间 (Asia/Bangkok)' },
  { value: 'Australia/Sydney', label: '悉尼时间 (Australia/Sydney)' },
  { value: 'Australia/Melbourne', label: '墨尔本时间 (Australia/Melbourne)' },
  { value: 'Pacific/Auckland', label: '奥克兰时间 (Pacific/Auckland)' },
  { value: 'Pacific/Honolulu', label: '夏威夷时间 (Pacific/Honolulu)' },
  { value: 'America/Anchorage', label: '阿拉斯加时间 (America/Anchorage)' },
  { value: 'America/Los_Angeles', label: '太平洋时间 (America/Los_Angeles)' },
  { value: 'America/Denver', label: '山地时间 (America/Denver)' },
  { value: 'America/Chicago', label: '中部时间 (America/Chicago)' },
  { value: 'America/New_York', label: '东部时间 (America/New_York)' },
  { value: 'America/Sao_Paulo', label: '巴西利亚时间 (America/Sao_Paulo)' },
  { value: 'Europe/London', label: '伦敦时间 (Europe/London)' },
  { value: 'Europe/Paris', label: '巴黎时间 (Europe/Paris)' },
  { value: 'Europe/Berlin', label: '柏林时间 (Europe/Berlin)' },
  { value: 'Europe/Moscow', label: '莫斯科时间 (Europe/Moscow)' },
  { value: 'Europe/Istanbul', label: '伊斯坦布尔时间 (Europe/Istanbul)' },
];

export const Component: React.FC<ToolViewProps<TimezoneConverterInput, TimezoneConverterOutput>> = ({
  tool,
  initialInput,
  onResult,
}) => {
  const [timestamp, setTimestamp] = useState<string>('');
  const [fromTz, setFromTz] = useState<string>(initialInput?.fromTz || 'UTC');
  const [toTz, setToTz] = useState<string>(initialInput?.toTz || 'Asia/Shanghai');
  const [format, setFormat] = useState<string>(initialInput?.format || "yyyy-MM-dd'T'HH:mm:ssXXX");
  const [result, setResult] = useState<TimezoneConverterOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    if (!timestamp.trim()) {
      setError('请输入时间戳');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const out = await tool.run({
        timestamp: timestamp.trim(),
        fromTz,
        toTz,
        format: format || "yyyy-MM-dd'T'HH:mm:ssXXX",
      });
      if (out.ok && out.data) {
        setResult(out.data);
        onResult?.(out);
      } else {
        setError(out.error || '未知错误');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tool-card" style={{ padding: 20, maxWidth: 600 }}>
      <h3 style={{ marginBottom: 16 }}>时区转换器</h3>

      <div style={{ display: 'grid', gap: 12, maxWidth: 500 }}>
        <div>
          <label htmlFor="tzc-timestamp" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
            时间戳（ISO 8601、Unix 毫秒、Unix 秒）
          </label>
          <input
            id="tzc-timestamp"
            className="tool-input"
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
            placeholder="1704067200000 或 2024-01-01T00:00:00Z"
            style={{ width: '100%', fontSize: 15, padding: '10px 12px', marginTop: 4 }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label htmlFor="tzc-fromTz" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              源时区
            </label>
            <select
              id="tzc-fromTz"
              className="tool-select"
              value={fromTz}
              onChange={(e) => setFromTz(e.target.value)}
              style={{ width: '100%', fontSize: 15, padding: '10px 12px' }}
            >
              {COMMON_TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="tzc-toTz" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              目标时区
            </label>
            <select
              id="tzc-toTz"
              className="tool-select"
              value={toTz}
              onChange={(e) => setToTz(e.target.value)}
              style={{ width: '100%', fontSize: 15, padding: '10px 12px' }}
            >
              {COMMON_TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="tzc-format" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
            输出格式（date-fns）
          </label>
          <input
            id="tzc-format"
            className="tool-input"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            placeholder="yyyy-MM-dd'T'HH:mm:ssXXX"
            style={{ width: '100%', fontSize: 15, padding: '10px 12px', marginTop: 4, fontFamily: 'monospace' }}
          />
        </div>

        <button
          type="button"
          className="tool-btn"
          onClick={run}
          disabled={loading || !timestamp.trim()}
          style={{ marginTop: 8 }}
        >
          {loading ? '转换中..' : '转换'}
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
            <div style={{ fontSize: 18, fontWeight: 600, fontFamily: 'monospace', marginBottom: 8 }}>
              {result.result}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13, color: '#64748b' }}>
              <div>
                <div style={{ fontWeight: 500 }}>源（{result.from.tz}）</div>
                <div style={{ fontFamily: 'monospace' }}>{result.from.iso}</div>
              </div>
              <div>
                <div style={{ fontWeight: 500 }}>目标（{result.to.tz}）</div>
                <div style={{ fontFamily: 'monospace' }}>{result.to.iso}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Component;
