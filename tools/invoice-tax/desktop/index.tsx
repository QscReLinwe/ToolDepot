import type { ToolViewProps } from '@tooldepot/types';
import type React from 'react';
import { useState } from 'react';
import type { InvoiceLine, InvoiceTaxInput, InvoiceTaxOutput } from '../core/index.js';

export const Component: React.FC<ToolViewProps<InvoiceTaxInput, InvoiceTaxOutput>> = ({
  tool,
  initialInput,
  onResult,
}) => {
  const [lines, setLines] = useState<InvoiceLine[]>(
    initialInput?.lines?.length ? initialInput.lines : [{ name: '商品', qty: 1, unitPrice: 100 }],
  );
  const [subtotal, setSubtotal] = useState<string>(String(initialInput?.subtotal ?? ''));
  const [taxRate, setTaxRate] = useState<string>(String(initialInput?.taxRate ?? '8'));
  const [discount, setDiscount] = useState<string>(String(initialInput?.discount ?? ''));
  const [currency, setCurrency] = useState<string>(String(initialInput?.currency ?? 'CNY'));
  const [result, setResult] = useState<InvoiceTaxOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const updateLine = (index: number, field: keyof InvoiceLine, value: string | number) => {
    const newLines = [...lines];
    const currentLine = newLines[index];
    if (!currentLine) return;
    newLines[index] = {
      ...currentLine,
      [field]: field === 'qty' || field === 'unitPrice' ? Number(value) : value,
    };
    setLines(newLines);
  };

  const addLine = () => {
    setLines([...lines, { name: '商品', qty: 1, unitPrice: 0 }]);
  };

  const removeLine = (index: number) => {
    if (lines.length <= 1) return;
    setLines(lines.filter((_, i) => i !== index));
  };

  const run = async () => {
    setLoading(true);
    setError(null);
    const validLines = lines.filter((l) => l.name?.trim() && l.qty > 0 && l.unitPrice >= 0);
    if (validLines.length === 0) {
      setError('至少需要一行有效的商品数据');
      setLoading(false);
      return;
    }
    try {
      const out = await tool.run({
        lines: validLines,
        subtotal: subtotal.trim() ? Number(subtotal) : undefined,
        taxRate: Number(taxRate),
        discount: discount.trim() ? Number(discount) : undefined,
        currency: currency.trim() ? currency : undefined,
      });
      if (out.ok && out.data) {
        setResult(out.data);
        onResult?.(out);
      } else {
        setError(out.error || '未知错误');
        setResult(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const lineRow = (line: InvoiceLine, index: number) => (
    <div
      key={index}
      style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr 40px',
        gap: 8,
        alignItems: 'center',
        marginBottom: 8,
      }}
    >
      <input
        className="tool-input"
        type="text"
        value={line.name}
        onChange={(e) => updateLine(index, 'name', e.target.value)}
        placeholder="商品名称"
        style={{ width: '100%', fontSize: 14, padding: '8px 10px' }}
      />
      <input
        className="tool-input"
        type="number"
        min={1}
        value={line.qty}
        onChange={(e) => updateLine(index, 'qty', Number(e.target.value))}
        style={{ width: '100%', fontSize: 14, padding: '8px 10px' }}
      />
      <input
        className="tool-input"
        type="number"
        min={0}
        step={0.01}
        value={line.unitPrice}
        onChange={(e) => updateLine(index, 'unitPrice', Number(e.target.value))}
        placeholder="单价"
        style={{ width: '100%', fontSize: 14, padding: '8px 10px' }}
      />
      <button
        type="button"
        className="tool-btn"
        onClick={() => removeLine(index)}
        disabled={lines.length <= 1}
        style={{ padding: '6px 10px', fontSize: 12, background: '#fee2e2', color: '#dc2626' }}
      >
        删{' '}
      </button>
    </div>
  );

  return (
    <div className="tool-card" style={{ padding: 20, maxWidth: 700 }}>
      <h3 style={{ marginBottom: 16 }}>发票税额计算</h3>
      <div style={{ display: 'grid', gap: 12, maxWidth: 650 }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontWeight: 500 }}>商品明细</span>
            <button type="button" className="tool-btn" onClick={addLine} style={{ padding: '6px 12px', fontSize: 13 }}>
              添加行{' '}
            </button>
          </div>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: 12, background: '#fafafa' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 40px',
                gap: 8,
                marginBottom: 8,
                fontSize: 12,
                color: '#6b7280',
                fontWeight: 500,
              }}
            >
              <span>商品名称</span>
              <span>数量</span>
              <span>单价</span>
              <span></span>
            </div>
            {lines.map(lineRow)}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label htmlFor="invoice-tax-subtotal" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              小计（可选，留空自动计算）
            </label>
            <input
              id="invoice-tax-subtotal"
              className="tool-input"
              type="number"
              step={0.01}
              value={subtotal}
              onChange={(e) => setSubtotal(e.target.value)}
              style={{ width: '100%', fontSize: 15, padding: '10px 12px' }}
            />
          </div>
          <div>
            <label htmlFor="invoice-tax-taxrate" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              税率 (%)
            </label>
            <input
              id="invoice-tax-taxrate"
              className="tool-input"
              type="number"
              step={0.01}
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
              style={{ width: '100%', fontSize: 15, padding: '10px 12px' }}
            />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label htmlFor="invoice-tax-discount" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              折扣
            </label>
            <input
              id="invoice-tax-discount"
              className="tool-input"
              type="number"
              step={0.01}
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              style={{ width: '100%', fontSize: 15, padding: '10px 12px' }}
            />
          </div>
          <div>
            <label htmlFor="invoice-tax-currency" style={{ display: 'block', marginBottom: 4, fontWeight: 500 }}>
              货币
            </label>
            <input
              id="invoice-tax-currency"
              className="tool-input"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              style={{ width: '100%', fontSize: 15, padding: '10px 12px' }}
            />
          </div>
        </div>

        <button
          type="button"
          className="tool-btn"
          onClick={run}
          disabled={loading}
          style={{ marginTop: 8, width: '100%', padding: '12px', fontSize: 16 }}
        >
          {loading ? '计算中...' : '计算'}
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 14 }}>
              <div>
                <strong>小计</strong> {result.subtotal}
              </div>
              <div>
                <strong>折扣</strong> {result.discount}
              </div>
              <div>
                <strong>应税金额</strong> {result.taxable}
              </div>
              <div>
                <strong>税额</strong> {result.tax}
              </div>
              <div style={{ gridColumn: '1 / -1', fontSize: 16, fontWeight: 600 }}>
                <strong>总计</strong> {result.total}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Component;
