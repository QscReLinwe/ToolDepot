#!/usr/bin/env node
import { pathToFileURL } from 'node:url';
import type { UrlMode } from '../core/index.js';
import { tool } from '../core/index.js';

function printUsage() {
  console.log(`Usage: td-url-parser --mode <parse|build|query> --url "<url>" [--base "<base>"]

Arguments:
  --mode, -m     parse|build|query (required)
  --url, -u      URL to parse (required for parse/query)
  --base, -b     Base URL for relative URLs (optional)
  --file, -f     Read URL from a file

Examples:
  td-url-parser -m parse -u "https://user:pass@example.com:8080/path?a=1&b=2#frag"
  td-url-parser -m query -u "https://x.com/?a=1&a=2&b=3"
`);
}

function parseArgs(argv: string[]) {
  const args: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg) continue;
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      if (!key) continue;
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith('-')) {
        args[key] = next;
        i++;
      } else {
        args[key] = 'true';
      }
    } else if (arg.startsWith('-') && arg.length === 2) {
      const key = arg.charAt(1);
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith('-')) {
        args[key] = next;
        i++;
      } else {
        args[key] = 'true';
      }
    }
  }
  return {
    mode: args.mode || args.m,
    url: args.url || args.u,
    base: args.base || args.b,
    file: args.file || args.f,
  };
}

export async function run(argv: string[]): Promise<void> {
  if (argv.includes('--help') || argv.includes('-h') || argv.length === 0) {
    printUsage();
    return;
  }

  const { mode, url, base, file } = parseArgs(argv);
  if (!mode) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  let urlValue = url;
  if (!urlValue && file) {
    try {
      const { readFileSync } = await import('node:fs');
      urlValue = readFileSync(file, 'utf8').trim();
    } catch (e) {
      console.error(`Could not read file: ${e instanceof Error ? e.message : String(e)}`);
      process.exitCode = 1;
      return;
    }
  }
  if (!urlValue && mode !== 'build') {
    printUsage();
    process.exitCode = 1;
    return;
  }

  const result = await tool.run({ mode: mode as UrlMode, url: urlValue, base });
  if (result.ok) {
    console.log(JSON.stringify(result.data?.result ?? {}, null, 2));
  } else {
    console.error(result.error ?? 'unknown error');
    process.exitCode = 1;
  }
}

const invokedDirectly = import.meta.url === pathToFileURL(process.argv[1] ?? '').href;
if (invokedDirectly) {
  run(process.argv.slice(2)).catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}
