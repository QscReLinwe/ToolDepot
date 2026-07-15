import type { ToolOutput } from '@tooldepot/types';

export type UrlMode = 'parse' | 'build' | 'query';

export interface UrlParseResult {
  href: string;
  origin: string;
  protocol: string;
  username: string;
  password: string;
  host: string;
  hostname: string;
  port: string;
  pathname: string;
  search: string;
  hash: string;
  query: Record<string, string[]>;
}

export interface UrlBuildParts {
  protocol?: string;
  username?: string;
  password?: string;
  host?: string;
  hostname?: string;
  port?: string;
  pathname?: string;
  search?: string;
  hash?: string;
}

export interface UrlParserInput {
  mode: UrlMode;
  url?: string;
  base?: string;
  parts?: UrlBuildParts;
}

export interface UrlParserOutput {
  result: UrlParseResult;
}

function parseQuery(search: string): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  const sp = new URLSearchParams(search);
  sp.forEach((value, key) => {
    // biome-ignore lint/suspicious/noAssignInExpressions: standard grouping pattern
    (out[key] ||= []).push(value);
  });
  return out;
}

function toResult(u: URL): UrlParseResult {
  return {
    href: u.href,
    origin: u.origin,
    protocol: u.protocol,
    username: u.username,
    password: u.password,
    host: u.host,
    hostname: u.hostname,
    port: u.port,
    pathname: u.pathname,
    search: u.search,
    hash: u.hash,
    query: parseQuery(u.search),
  };
}

export const tool = {
  id: 'url-parser',
  name: 'URL 解析器',
  description: '将 URL 解析为协议、主机、路径、查询与哈希。',
  category: 'utility',
  async run(input: UrlParserInput): Promise<ToolOutput<UrlParserOutput>> {
    const mode = input?.mode;
    if (mode !== 'parse' && mode !== 'build' && mode !== 'query') {
      return { ok: false, error: 'mode must be "parse" | "build" | "query"' };
    }

    if (mode === 'build') {
      const parts = input?.parts || {};
      try {
        const u = new URL('http://localhost');
        if (parts.protocol) u.protocol = parts.protocol;
        if (parts.username !== undefined) u.username = parts.username;
        if (parts.password !== undefined) u.password = parts.password;
        if (parts.host) {
          u.host = parts.host;
        } else {
          if (parts.hostname) u.hostname = parts.hostname;
          if (parts.port) u.port = parts.port;
        }
        if (parts.pathname) u.pathname = parts.pathname;
        if (parts.search) u.search = parts.search;
        if (parts.hash) u.hash = parts.hash;
        return { ok: true, data: { result: toResult(u) } };
      } catch (e) {
        return { ok: false, error: e instanceof Error ? e.message : String(e) };
      }
    }

    const urlStr = input?.url;
    if (typeof urlStr !== 'string' || !urlStr.trim()) {
      return { ok: false, error: 'Missing required field: url' };
    }
    try {
      const u = input?.base ? new URL(urlStr, input.base) : new URL(urlStr);
      return { ok: true, data: { result: toResult(u) } };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  },
};

export default tool;
