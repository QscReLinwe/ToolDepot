import type { ToolViewProps } from '@tooldepot/types';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import type { CountdownInput, CountdownOutput } from '../core/index.js';

export const Component: React.FC<ToolViewProps<CountdownInput, CountdownOutput>> = ({
  tool,
  initialInput,
  onResult,
}) => {
  const [duration, setDuration] = useState<string>(initialInput?.duration ?? '25m');
  const [result, setResult] = useState<CountdownOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Timer state
  const [isRunning, setIsRunning] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const run = async () => {
    setError(null);
    if (!duration) {
      setError('请输入倒计时时长');
      return;
    }
    const out = await tool.run({ duration });
    if (out.ok && out.data) {
      setResult(out.data);
      setRemainingSeconds(out.data.totalSeconds);
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
    setRemainingSeconds(result?.totalSeconds ?? 0);
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

  const durationField = (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
        倒计时时长（如 25m, 1h30m, 1:30:00, 90s）
        <input
          className="tool-input"
          type="text"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="25m"
          style={{ width: '100%', fontSize: 15, padding: '10px 12px' }}
        />
      </label>
    </div>
  );

  return (
    <div className="tool-card" style={{ padding: 20, maxWidth: 500 }}>
      <h3 style={{ marginBottom: 16 }}>倒计时</h3>

      {durationField}

      <button
        type="button"
        className="tool-btn"
        onClick={run}
        style={{ width: '100%', padding: '12px', fontSize: 16, marginBottom: 16 }}
      >
        设置倒计时
      </button>

      {error && (
        <div style={{ color: '#dc2626', marginBottom: 12, padding: 12, background: '#fef2f2', borderRadius: 6 }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: 16, padding: 16, background: '#f8fafc', borderRadius: 8 }}>
          <div
            style={{ fontSize: 48, fontWeight: 700, textAlign: 'center', color: '#166534', fontFamily: 'monospace' }}
          >
            {formatTime(remainingSeconds)}
          </div>
          <div style={{ textAlign: 'center', marginTop: 8, color: '#6b7280' }}>
            总计: {result.formatted} &nbsp;|&nbsp; 结束: {new Date(result.endTime).toLocaleTimeString('zh-CN')}
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
