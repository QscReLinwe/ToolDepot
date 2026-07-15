import type { ToolViewProps } from '@tooldepot/types';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import type { AlarmInput, AlarmOutput } from '../core/index.js';

export const Component: React.FC<ToolViewProps<AlarmInput, AlarmOutput>> = ({ tool, initialInput, onResult }) => {
  const [time, setTime] = useState<string>(initialInput?.time ?? '');
  const [label, setLabel] = useState<string>(initialInput?.label ?? '');
  const [result, setResult] = useState<AlarmOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Timer state
  const [isRunning, setIsRunning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const run = async () => {
    setError(null);
    if (!time) {
      setError('请输入时间');
      return;
    }
    const out = await tool.run({ time, label: label || undefined });
    if (out.ok && out.data) {
      setResult(out.data);
      setRemainingSeconds(out.data.secondsUntil);
      setIsRunning(false);
    } else {
      setError(out.error ?? '未知错误');
      setResult(null);
    }
    onResult?.(out);
  };

  const startTimer = () => {
    if (remainingSeconds <= 0 || isRunning) return;
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
  };

  const resetTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRunning(false);
    setRemainingSeconds(result?.secondsUntil ?? 0);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const timeField = (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
        时间 {time.includes('T') ? '(YYYY-MM-DDTHH:mm)' : '(HH:mm)'}
        <input
          className="tool-input"
          type="text"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          placeholder="07:30"
          style={{ width: '100%', fontSize: 15, padding: '10px 12px' }}
        />
      </label>
    </div>
  );

  const labelField = (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
        提醒消息（可选）
        <input
          className="tool-input"
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="时间到！"
          style={{ width: '100%', fontSize: 15, padding: '10px 12px' }}
        />
      </label>
    </div>
  );

  return (
    <div className="tool-card" style={{ padding: 20, maxWidth: 500 }}>
      <h3 style={{ marginBottom: 16 }}>闹钟</h3>

      {timeField}
      {labelField}

      <button
        type="button"
        className="tool-btn"
        onClick={run}
        style={{ width: '100%', padding: '12px', fontSize: 16, marginBottom: 16 }}
      >
        设置
      </button>

      {error && (
        <div style={{ color: '#dc2626', marginBottom: 12, padding: 12, background: '#fef2f2', borderRadius: 6 }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: 16, padding: 16, background: '#f0fdf4', borderRadius: 8 }}>
          <div
            style={{ fontSize: 48, fontWeight: 700, textAlign: 'center', color: '#166534', fontFamily: 'monospace' }}
          >
            {formatTime(remainingSeconds)}
          </div>
          <div style={{ textAlign: 'center', marginTop: 8, color: '#6b7280' }}>
            触发时间: {new Date(result.triggerTime).toLocaleString('zh-CN')}
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
            <button
              type="button"
              className="tool-btn"
              onClick={isRunning ? pauseTimer : startTimer}
              disabled={remainingSeconds === 0}
              style={{ padding: '8px 20px' }}
            >
              {isRunning ? '暂停' : remainingSeconds === 0 ? '重新开始' : '开始'}
            </button>
            <button
              type="button"
              className="tool-btn"
              onClick={resetTimer}
              style={{ padding: '8px 20px', background: '#6b7280' }}
            >
              重置
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Component;
