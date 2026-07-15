import type { ToolViewProps } from '@tooldepot/types';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import type { PomodoroInput, PomodoroOutput, PomodoroSegmentType } from '../core/index.js';

const SEGMENT_LABEL: Record<PomodoroSegmentType, string> = {
  work: '工作',
  break: '休息',
  longBreak: '长休息',
};

const SEGMENT_COLOR: Record<PomodoroSegmentType, string> = {
  work: '#dc2626',
  break: '#16a34a',
  longBreak: '#2563eb',
};

export const Component: React.FC<ToolViewProps<PomodoroInput, PomodoroOutput>> = ({ tool, initialInput, onResult }) => {
  const [workMin, setWorkMin] = useState<string>(String(initialInput?.workMin ?? 25));
  const [breakMin, setBreakMin] = useState<string>(String(initialInput?.breakMin ?? 5));
  const [longBreakMin, setLongBreakMin] = useState<string>(String(initialInput?.longBreakMin ?? 15));
  const [rounds, setRounds] = useState<string>(String(initialInput?.rounds ?? 4));
  const [result, setResult] = useState<PomodoroOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Timer state
  const [isRunning, setIsRunning] = useState(false);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const run = async () => {
    setError(null);
    const out = await tool.run({
      workMin: Number(workMin),
      breakMin: Number(breakMin),
      longBreakMin: Number(longBreakMin),
      rounds: Number(rounds),
    });
    if (out.ok && out.data) {
      setResult(out.data);
      // Initialize timer with first segment
      setCurrentSegmentIndex(0);
      setRemainingSeconds(out.data.schedule[0]!.minutes * 60);
    } else {
      setError(out.error ?? '未知错误');
      setResult(null);
    }
    onResult?.(out);
  };

  const startTimer = () => {
    if (!result || isRunning) return;
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          // Move to next segment
          const nextIndex = currentSegmentIndex + 1;
          if (nextIndex >= (result?.schedule.length ?? 0)) {
            // Timer complete
            if (intervalRef.current) clearInterval(intervalRef.current);
            setIsRunning(false);
            setCurrentSegmentIndex(0);
            setRemainingSeconds(0);
            return 0;
          }
          setCurrentSegmentIndex(nextIndex);
          const nextSeg = result.schedule[nextIndex];
          return nextSeg ? nextSeg.minutes * 60 : 0;
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
    setCurrentSegmentIndex(0);
    const firstSeg = result?.schedule[0];
    if (firstSeg) setRemainingSeconds(firstSeg.minutes * 60);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const numField = (label: string, value: string, onChange: (v: string) => void) => (
    <div>
      <label htmlFor={label} style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
        {label}
      </label>
      <input
        className="tool-input"
        id={label}
        type="number"
        min={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: '100%', fontSize: 15, padding: '10px 12px' }}
      />
    </div>
  );

  const currentSeg = result?.schedule[currentSegmentIndex];

  return (
    <div className="tool-card" style={{ padding: 20, maxWidth: 600 }}>
      <h3 style={{ marginBottom: 16 }}>番茄钟计时器</h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxWidth: 500 }}>
        {numField('工作（分钟）', workMin, setWorkMin)}
        {numField('休息（分钟）', breakMin, setBreakMin)}
        {numField('长休息（分钟）', longBreakMin, setLongBreakMin)}
        {numField('轮数', rounds, setRounds)}
      </div>

      <button type="button" className="tool-btn" onClick={run} style={{ marginTop: 12 }}>
        生成计划
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
          <div style={{ fontWeight: 600, marginBottom: 8 }}>总计：{result.totalMinutes} 分钟</div>

          {/* Live Timer Display */}
          <div style={{ marginTop: 16, padding: 16, background: '#f8fafc', borderRadius: 8 }}>
            <div
              style={{
                fontSize: 48,
                fontWeight: 700,
                textAlign: 'center',
                color: currentSeg ? SEGMENT_COLOR[currentSeg.type] : '#374151',
                fontFamily: 'monospace',
              }}
            >
              {formatTime(remainingSeconds)}
            </div>
            <div style={{ textAlign: 'center', marginTop: 8, color: '#6b7280' }}>
              {currentSeg ? SEGMENT_LABEL[currentSeg.type] : '未开始'} {currentSegmentIndex + 1} /{' '}
              {result.schedule.length}
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
              <button
                type="button"
                className="tool-btn"
                onClick={isRunning ? pauseTimer : startTimer}
                disabled={!result || remainingSeconds === 0}
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

          <ol style={{ margin: '16px 0 0', paddingLeft: 20 }}>
            {result.schedule.map((seg, i) => (
              <li
                key={`${seg.type}-${seg.minutes}`}
                style={{
                  marginBottom: 4,
                  fontWeight: i === currentSegmentIndex && isRunning ? 600 : 400,
                  color: i === currentSegmentIndex && isRunning ? SEGMENT_COLOR[seg.type] : '#374151',
                }}
              >
                <span style={{ fontWeight: 600, color: SEGMENT_COLOR[seg.type] }}>{SEGMENT_LABEL[seg.type]}</span> —{' '}
                {seg.minutes} 分钟
                {i === currentSegmentIndex && isRunning && (
                  <span style={{ marginLeft: 8, color: SEGMENT_COLOR[seg.type] }}>▶</span>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

export default Component;
