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

    let regex: RegExp;
    try {
      regex = new RegExp(pattern, flags);
    } catch (e) {
      return {
        ok: true,
        data: { matches: [], matchCount: 0, error: e instanceof Error ? e.message : String(e) },
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
          ok: true,
          data: { matches, matchCount: matches.length, error: e instanceof Error ? e.message : String(e) },
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
