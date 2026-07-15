import type { Tool, ToolInput, ToolOutput } from '@tooldepot/types';
import QRCode from 'qrcode';

export type ErrorCorrection = 'L' | 'M' | 'Q' | 'H';

export interface QrCodeInput extends ToolInput {
  text: string;
  /** Output image size in pixels (default 256). */
  size?: number;
  /** Error correction level (default 'M'). */
  errorCorrection?: ErrorCorrection;
  /** Quiet-zone margin in modules (default 4). */
  margin?: number;
}

export interface QrCodeOutput {
  dataUrl: string;
}

const ECC_LEVELS: ErrorCorrection[] = ['L', 'M', 'Q', 'H'];

export const tool: Tool<QrCodeInput, QrCodeOutput> = {
  id: 'qr-code',
  name: '二维码生成',
  description: '根据文本生成二维码图片。',
  category: 'generate',
  async run(input) {
    const text = input?.text;

    if (typeof text !== 'string' || !text.trim()) {
      return { ok: false, error: 'text is required (non-empty string)' };
    }

    const size = typeof input?.size === 'number' ? input.size : 256;
    if (!Number.isFinite(size) || size < 32 || size > 4096) {
      return { ok: false, error: 'size must be a number between 32 and 4096' };
    }

    const errorCorrection: ErrorCorrection =
      typeof input?.errorCorrection === 'string' && ECC_LEVELS.includes(input.errorCorrection as ErrorCorrection)
        ? (input.errorCorrection as ErrorCorrection)
        : 'M';

    const margin = typeof input?.margin === 'number' ? input.margin : 4;
    if (!Number.isFinite(margin) || margin < 0 || margin > 40) {
      return { ok: false, error: 'margin must be a number between 0 and 40' };
    }

    try {
      const dataUrl = await QRCode.toDataURL(text, {
        errorCorrectionLevel: errorCorrection,
        margin,
        width: Math.round(size),
      });

      const output: ToolOutput<QrCodeOutput> = {
        ok: true,
        data: { dataUrl },
        mimeType: 'image/png',
        filename: 'qrcode.png',
      };
      return output;
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  },
};

export default tool;
