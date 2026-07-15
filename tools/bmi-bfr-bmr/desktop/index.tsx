import type { ToolViewProps } from '@tooldepot/types';
import type React from 'react';
import { useState } from 'react';
import type { BmiBfrBmrInput, BmiBfrBmrOutput, Sex } from '../core/index.js';

export const Component: React.FC<ToolViewProps<BmiBfrBmrInput, BmiBfrBmrOutput>> = ({
  tool,
  initialInput,
  onResult,
}) => {
  const [weightKg, setWeightKg] = useState<string>(String(initialInput?.weightKg ?? ''));
  const [heightCm, setHeightCm] = useState<string>(String(initialInput?.heightCm ?? ''));
  const [age, setAge] = useState<string>(String(initialInput?.age ?? ''));
  const [sex, setSex] = useState<Sex>(initialInput?.sex || 'male');
  const [waistCm, setWaistCm] = useState<string>(String(initialInput?.waistCm ?? ''));
  const [neckCm, setNeckCm] = useState<string>(String(initialInput?.neckCm ?? ''));
  const [hipCm, setHipCm] = useState<string>(String(initialInput?.hipCm ?? ''));
  const [result, setResult] = useState<BmiBfrBmrOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const out = await tool.run({
        weightKg: Number(weightKg),
        heightCm: Number(heightCm),
        age: Number(age),
        sex,
        waistCm: waistCm ? Number(waistCm) : undefined,
        neckCm: neckCm ? Number(neckCm) : undefined,
        hipCm: hipCm ? Number(hipCm) : undefined,
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

  const numField = (label: string, value: string, setter: (v: string) => void, placeholder: string) => (
    <div>
      <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
        {label}
        <input
          className="tool-input"
          type="number"
          value={value}
          onChange={(e) => setter(e.target.value)}
          placeholder={placeholder}
          style={{ width: '100%', fontSize: 15, padding: '10px 12px', marginTop: 4 }}
        />
      </label>
    </div>
  );

  return (
    <div className="tool-card" style={{ padding: 20, maxWidth: 600 }}>
      <h3 style={{ marginBottom: 16 }}>BMI / BMR / 体脂率</h3>

      <div style={{ display: 'grid', gap: 12, maxWidth: 500 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {numField('体重（kg）', weightKg, setWeightKg, '80')}
          {numField('身高（cm）', heightCm, setHeightCm, '180')}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {numField('年龄（岁）', age, setAge, '30')}
          <div>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              性别
              <select
                className="tool-select"
                value={sex}
                onChange={(e) => setSex(e.target.value as Sex)}
                style={{ width: '100%', fontSize: 15, padding: '10px 12px' }}
              >
                <option value="male">男</option>
                <option value="female">女</option>
              </select>
            </label>
          </div>
        </div>

        <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>可选 — 输入围度可使用美国海军体脂计算法：</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          {numField('腰围（cm）', waistCm, setWaistCm, '90')}
          {numField('颈围（cm）', neckCm, setNeckCm, '38')}
          {numField('臀围（cm）', hipCm, setHipCm, '100')}
        </div>

        <button type="button" className="tool-btn" onClick={run} disabled={loading} style={{ marginTop: 8 }}>
          {loading ? '计算中…' : '计算'}
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ fontSize: 13, color: '#64748b' }}>BMI</div>
                <div style={{ fontSize: 20, fontWeight: 600 }}>{result.bmi}</div>
                <div style={{ fontSize: 13, color: '#64748b' }}>{result.bmiCategory}</div>
              </div>
              <div>
                <div style={{ fontSize: 13, color: '#64748b' }}>BMR（千卡/天）</div>
                <div style={{ fontSize: 20, fontWeight: 600 }}>{result.bmr}</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
              <div>
                <div style={{ fontSize: 13, color: '#64748b' }}>体脂率 %（Deurenberg 法）</div>
                <div style={{ fontSize: 18, fontWeight: 600 }}>{result.bodyFat}</div>
              </div>
              {result.bodyFatNavy !== undefined && (
                <div>
                  <div style={{ fontSize: 13, color: '#64748b' }}>体脂率 %（美国海军法）</div>
                  <div style={{ fontSize: 18, fontWeight: 600 }}>{result.bodyFatNavy}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Component;
