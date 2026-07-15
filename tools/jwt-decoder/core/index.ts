import type { ToolOutput } from '@tooldepot/types';

export interface JwtDecoderInput {
  /** The JWT string (header.payload.signature). */
  token: string;
}

export interface JwtDecoderOutput {
  /** Decoded header claims. */
  header: Record<string, unknown>;
  /** Decoded payload claims. */
  payload: Record<string, unknown>;
  /** Whether a non-empty signature segment was present. */
  signaturePresent: boolean;
  /** True when exp is in the past. Undefined if no exp claim. */
  expired?: boolean;
  /** ISO timestamp of exp, when present. */
  expiresAt?: string;
  /** ISO timestamp of iat, when present. */
  issuedAt?: string;
  /** Set when the token cannot be decoded. */
  error?: string;
}

function base64UrlDecode(segment: string): string {
  let b64 = segment.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4;
  if (pad) b64 += '='.repeat(4 - pad);
  const bin = atob(b64);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function toIso(claim: unknown): string | undefined {
  if (typeof claim !== 'number' && typeof claim !== 'string') return undefined;
  const n = typeof claim === 'number' ? claim : Number(claim);
  if (Number.isNaN(n)) return undefined;
  // JWT numeric dates are seconds; allow ms if very large
  const ms = n > 1e12 ? n : n * 1000;
  const d = new Date(ms);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

export const tool = {
  id: 'jwt-decoder',
  name: 'JWT 解码器',
  description: '不校验地解码与查看 JWT 令牌。',
  category: 'crypto',
  async run(input: JwtDecoderInput): Promise<ToolOutput<JwtDecoderOutput>> {
    const token = typeof input?.token === 'string' ? input.token.trim() : '';

    if (token === '') {
      return { ok: false, error: 'Token is empty' };
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return { ok: false, error: `Expected 3 dot-separated segments, got ${parts.length}` };
    }

    const [headerSeg, payloadSeg, sigSeg] = parts;

    let header: Record<string, unknown>;
    let payload: Record<string, unknown>;
    try {
      header = JSON.parse(base64UrlDecode(headerSeg ?? ''));
      payload = JSON.parse(base64UrlDecode(payloadSeg ?? ''));
    } catch (e) {
      return { ok: false, error: `Failed to decode JSON segments: ${e instanceof Error ? e.message : String(e)}` };
    }

    if (typeof header !== 'object' || header === null) {
      return { ok: false, error: 'Header is not a JSON object' };
    }
    if (typeof payload !== 'object' || payload === null) {
      return { ok: false, error: 'Payload is not a JSON object' };
    }

    const exp = payload.exp;
    const iat = payload.iat;
    const expiresAt = toIso(exp);
    const issuedAt = toIso(iat);
    const expired = expiresAt !== undefined ? Date.now() >= new Date(expiresAt).getTime() : undefined;

    return {
      ok: true,
      data: {
        header,
        payload,
        signaturePresent: (sigSeg ?? '').trim() !== '',
        expired,
        expiresAt,
        issuedAt,
      },
      mimeType: 'application/json',
    };
  },
};

export default tool;
