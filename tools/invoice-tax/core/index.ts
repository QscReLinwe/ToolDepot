import type { Tool, ToolOutput } from '@tooldepot/types';

export interface InvoiceLine {
  name: string;
  qty: number;
  unitPrice: number;
}

export interface InvoiceTaxInput {
  lines?: InvoiceLine[];
  /** 预计算的小计；当省略 `lines` 时使用。 */
  subtotal?: number;
  /** 税率（百分比，如 8 表示 8%）。 */
  taxRate: number;
  /** 税前折扣金额（绝对金额）。 */
  discount?: number;
  currency?: string;
}

export interface InvoiceTaxOutput {
  subtotal: number;
  discount: number;
  taxable: number;
  tax: number;
  total: number;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export const tool: Tool<InvoiceTaxInput, InvoiceTaxOutput> = {
  id: 'invoice-tax',
  name: '发票税额计算',
  description: '计算发票小计、折扣、税额与合计',
  category: 'finance',
  async run(input: InvoiceTaxInput): Promise<ToolOutput<InvoiceTaxOutput>> {
    const lines = input?.lines;
    const subtotalInput = input?.subtotal;
    const taxRate = input?.taxRate;
    const discount = input?.discount;

    if (typeof taxRate !== 'number' || !Number.isFinite(taxRate) || taxRate < 0) {
      return { ok: false, error: 'taxRate 必须是非负数字' };
    }
    if (discount !== undefined && (typeof discount !== 'number' || !Number.isFinite(discount) || discount < 0)) {
      return { ok: false, error: 'discount 必须是非负数字' };
    }

    let subtotal: number;
    if (Array.isArray(lines) && lines.length > 0) {
      for (const line of lines) {
        if (
          typeof line?.qty !== 'number' ||
          !Number.isFinite(line.qty) ||
          typeof line?.unitPrice !== 'number' ||
          !Number.isFinite(line.unitPrice)
        ) {
          return { ok: false, error: '每行必须包含数字 qty 和 unitPrice' };
        }
      }
      subtotal = lines.reduce((sum, line) => sum + line.qty * line.unitPrice, 0);
    } else if (typeof subtotalInput === 'number' && Number.isFinite(subtotalInput)) {
      if (subtotalInput < 0) {
        return { ok: false, error: 'subtotal 必须是非负数字' };
      }
      subtotal = subtotalInput;
    } else {
      return { ok: false, error: '请提供 lines 或非负 subtotal' };
    }

    const discountAmount = discount ?? 0;
    const taxable = Math.max(subtotal - discountAmount, 0);
    const tax = taxable * (taxRate / 100);
    const total = taxable + tax;

    return {
      ok: true,
      data: {
        subtotal: round2(subtotal),
        discount: round2(discountAmount),
        taxable: round2(taxable),
        tax: round2(tax),
        total: round2(total),
      },
      mimeType: 'application/json',
    };
  },
};

export default tool;
