import type { Tool, ToolOutput } from '@tooldepot/types';

export interface RegexTesterInput {
  /** Regular expression pattern. */
  pattern: string;
  /** Regex flags (e.g. 'gi'). Invalid flags are reported in error. */
  flags?: string;
  /** The text to test against. */
  text: string;
  /** Optional replacement string applied via String.replace when provided. */
  replace?: string;
}

export interface RegexMatch {
  match: string;
  index: number;
  groups?: string[];
}

export interface RegexTesterOutput {
  matches: RegexMatch[];
  matchCount: number;
  replaced?: string;
  error?: string;
}

// Classic catastrophic-backtracking (ReDoS) patterns. These are detected via a
// lightweight static scan before constructing the RegExp so a malicious or
// pathological pattern cannot hang the process. No third-party dependency.
const REDOS_PATTERNS: RegExp[] = [
  /\(([^()]+|[^\n()]*\\.)*\)[+*]\1/, // repeated capturing group: (a+)+\1
  /\([^()]*[+*][^()]*\)\s*\([^()]*[+*][^()]*\)/, // adjacent quantified groups: (a+)(a+)
  /\((?:[^()]|\([^()]*\))*\)[+*]\((?:[^()]|\([^()]*\))*\)[+*]/, // two adjacent quantified groups
  /\([^(]*[+*][^)]*\)[+*]/, // nested quantifier: (a+)+ / (a*)*
  /\([^|]*\|[^|]*\)[+*]/, // quantified alternation group: (a|b)+
  /\([^)]*\|[^)]*\)\s*\([^)]*\|[^)]*\)/, // two adjacent alternation groups
  /([a-zA-Z0-9])\1[+*]/, // repeated char class with quantifier: (a)\1+
];

function hasCatastrophicBacktrackingRisk(pattern: string): boolean {
  // Strip escaped characters so we don't flag literals like \(+\).
  const unescaped = pattern.replace(/\\./g, '');
  return REDOS_PATTERNS.some((re) => re.test(unescaped));
}

export const tool: Tool<RegexTesterInput, RegexTesterOutput> = {
  id: 'regex-tester',
  name: '正则测试器',
  description: '实时高亮匹配地测试正则表达式。',
  category: 'dev',
  async run(input: RegexTesterInput): Promise<ToolOutput<RegexTesterOutput>> {
    const pattern = typeof input?.pattern === 'string' ? input.pattern : '';
    const flags = typeof input?.flags === 'string' ? input.flags : '';
    const text = typeof input?.text === 'string' ? input.text : '';
    const replace = input?.replace;

    if (pattern === '') {
      return { ok: false, error: 'Pattern is required' };
    }

    if (hasCatastrophicBacktrackingRisk(pattern)) {
      return { ok: false, error: '该正则存在灾难性回溯风险(ReDoS)' };
    }

    let regex: RegExp;
    try {
      regex = new RegExp(pattern, flags);
    } catch (e) {
      return {
        ok: false,
        error: `无效的正则表达式: ${e instanceof Error ? e.message : String(e)}`,
      };
    }

    const matches: RegexMatch[] = [];
    if (regex.global) {
      let m: RegExpExecArray | null;
      let guard = 0;
      // biome-ignore lint/suspicious/noAssignInExpressions: standard regex exec loop pattern
      while ((m = regex.exec(text)) !== null) {
        matches.push({ match: m[0], index: m.index, groups: m.slice(1) });
        if (m.index === regex.lastIndex) regex.lastIndex++;
        if (++guard > 100000) break;
      }
    } else {
      const m = regex.exec(text);
      if (m) matches.push({ match: m[0], index: m.index, groups: m.slice(1) });
    }

    let replaced: string | undefined;
    if (typeof replace === 'string') {
      try {
        replaced = text.replace(regex, replace);
      } catch (e) {
        return {
          ok: false,
          error: `替换失败: ${e instanceof Error ? e.message : String(e)}`,
        };
      }
    }

    return {
      ok: true,
      data: { matches, matchCount: matches.length, replaced, error: undefined },
      mimeType: 'application/json',
    };
  },
};

export default tool;
