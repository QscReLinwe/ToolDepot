import type { Tool, ToolOutput } from '@tooldepot/types';

export interface PasswordStrengthInput {
  /** Password to analyze */
  password: string;
}

export interface PasswordStrengthOutput {
  /** Strength score 0 (weak) – 4 (strong) */
  score: number;
  /** Estimated entropy in bits: log2(poolSize ^ length) */
  entropy: number;
  /** Human-readable improvement suggestions */
  suggestions: string[];
  /** Rough crack-time estimate (e.g. "instantly", "3 hours") */
  crackTimeEstimate?: string;
}

// Small built-in list of commonly used weak passwords (~20).
const COMMON_PASSWORDS = new Set<string>([
  'password',
  '123456',
  '12345678',
  '123456789',
  'qwerty',
  'abc123',
  'password1',
  '111111',
  '000000',
  'admin',
  'letmein',
  'welcome',
  'monkey',
  'dragon',
  'iloveyou',
  'sunshine',
  'princess',
  'football',
  'qwerty123',
  'password123',
]);

function estimatePool(password: string): number {
  let pool = 0;
  if (/[a-z]/.test(password)) pool += 26;
  if (/[A-Z]/.test(password)) pool += 26;
  if (/[0-9]/.test(password)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(password)) pool += 33; // common symbols
  return pool;
}

function scoreFromEntropy(entropy: number): number {
  if (entropy < 28) return 0;
  if (entropy < 36) return 1;
  if (entropy < 60) return 2;
  if (entropy < 128) return 3;
  return 4;
}

function estimateCrackTime(entropy: number): string {
  // Assume 1e10 guesses/sec (modern offline hash cracking rig).
  const guessesPerSecond = 1e10;
  const averageGuesses = 2 ** entropy / 2;
  const seconds = averageGuesses / guessesPerSecond;

  if (seconds < 1) return 'instantly';
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
  if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
  if (seconds < 31536000 * 100) return `${Math.round(seconds / 31536000)} years`;
  return 'centuries';
}

export const tool: Tool<PasswordStrengthInput, PasswordStrengthOutput> = {
  id: 'password-strength',
  name: '密码强度检测',
  description: '分析密码强度与熵值。',
  category: 'security',
  async run(input: PasswordStrengthInput): Promise<ToolOutput<PasswordStrengthOutput>> {
    const password = input?.password;
    if (typeof password !== 'string') {
      return { ok: false, error: 'password is required' };
    }

    const suggestions: string[] = [];
    const length = password.length;
    const pool = estimatePool(password);

    if (length === 0) {
      return {
        ok: true,
        data: { score: 0, entropy: 0, suggestions: ['Enter a password to analyze'], crackTimeEstimate: 'instantly' },
        mimeType: 'application/json',
      };
    }

    if (pool === 0) {
      return {
        ok: true,
        data: {
          score: 0,
          entropy: 0,
          suggestions: ['Use a mix of letters, numbers, and symbols'],
          crackTimeEstimate: 'instantly',
        },
        mimeType: 'application/json',
      };
    }

    const entropy = Math.round(length * Math.log2(pool));

    if (COMMON_PASSWORDS.has(password.toLowerCase())) {
      suggestions.push('This is a very common password — avoid it');
    }
    if (length < 8) {
      suggestions.push('Use at least 8 characters');
    }
    if (!/[a-z]/.test(password)) {
      suggestions.push('Add lowercase letters');
    }
    if (!/[A-Z]/.test(password)) {
      suggestions.push('Add uppercase letters');
    }
    if (!/[0-9]/.test(password)) {
      suggestions.push('Add numbers');
    }
    if (!/[^a-zA-Z0-9]/.test(password)) {
      suggestions.push('Add symbols (e.g. !@#$%)');
    }
    if (/(.)\1\1/.test(password)) {
      suggestions.push('Avoid repeated characters (e.g. "aaa")');
    }
    if (/^(?:password|123456|qwerty|admin)/i.test(password)) {
      suggestions.push('Avoid common base words like "password" or "123456"');
    }

    const score = scoreFromEntropy(entropy);
    if (score >= 3 && suggestions.length === 0) {
      suggestions.push('Looks strong — consider using a unique password per site');
    }

    return {
      ok: true,
      data: {
        score,
        entropy,
        suggestions,
        crackTimeEstimate: estimateCrackTime(entropy),
      },
      mimeType: 'application/json',
    };
  },
};

export default tool;
