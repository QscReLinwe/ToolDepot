import type { ToolOutput } from '@tooldepot/types';

export interface PasswordGeneratorInput {
  length?: number;
  uppercase?: boolean;
  lowercase?: boolean;
  digits?: boolean;
  symbols?: boolean;
  excludeSimilar?: boolean;
  count?: number;
}

export interface PasswordGeneratorOutput {
  passwords: string[];
  entropy: number;
}

const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const DIGITS = '0123456789';
const SYMBOLS = '!@#$%^&*()-_=+[]{};:,.<>?';
const SIMILAR = new Set(['i', 'l', '1', 'L', 'o', 'O', '0', 'I', '|']);

function getCrypto(): Crypto {
  const c = globalThis.crypto;
  if (!c || typeof c.getRandomValues !== 'function') {
    throw new Error('Secure crypto is not available in this environment');
  }
  return c;
}

function randomIndex(maxExclusive: number, crypto: Crypto): number {
  // Uniform sampling via rejection to avoid modulo bias.
  const limit = Math.floor(0xffffffff / maxExclusive) * maxExclusive;
  const buf = new Uint32Array(1);
  let value: number;
  do {
    crypto.getRandomValues(buf);
    value = buf[0] as number;
  } while (value >= limit);
  return value % maxExclusive;
}

export const tool = {
  id: 'password-generator',
  name: '密码生成器',
  description: '生成带熵值的安全随机密码。',
  category: 'crypto',
  async run(input: PasswordGeneratorInput): Promise<ToolOutput<PasswordGeneratorOutput>> {
    const length = input?.length ?? 16;
    const uppercase = input?.uppercase ?? true;
    const lowercase = input?.lowercase ?? true;
    const digits = input?.digits ?? true;
    const symbols = input?.symbols ?? true;
    const excludeSimilar = input?.excludeSimilar ?? false;
    const count = input?.count ?? 1;

    if (!Number.isInteger(length) || length < 1 || length > 512) {
      return { ok: false, error: 'length must be an integer between 1 and 512' };
    }
    if (!Number.isInteger(count) || count < 1 || count > 1000) {
      return { ok: false, error: 'count must be an integer between 1 and 1000' };
    }

    let pool = '';
    if (uppercase) pool += UPPER;
    if (lowercase) pool += LOWER;
    if (digits) pool += DIGITS;
    if (symbols) pool += SYMBOLS;

    if (excludeSimilar) {
      pool = pool
        .split('')
        .filter((ch) => !SIMILAR.has(ch))
        .join('');
    }

    if (pool.length === 0) {
      return {
        ok: false,
        error: 'No character set selected. Enable at least one of uppercase, lowercase, digits, or symbols.',
      };
    }

    let crypto: Crypto;
    try {
      crypto = getCrypto();
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }

    const passwords: string[] = [];
    for (let p = 0; p < count; p++) {
      let pw = '';
      for (let i = 0; i < length; i++) {
        pw += pool[randomIndex(pool.length, crypto)];
      }
      passwords.push(pw);
    }

    const entropy = Math.round(length * (Math.log(pool.length) / Math.log(2)));

    return { ok: true, data: { passwords, entropy }, mimeType: 'application/json' };
  },
};

export default tool;
