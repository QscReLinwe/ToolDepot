#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { tool } from '../core/index.js';

function printUsage() {
  console.log(`Usage: td-diff-tool --a <text|file> --b <text|file> [--mode line|char] [--ignore-whitespace]

Options:
  --a, -a         First text or @file path (required)
  --b, -b         Second text or @file path (required)
  --mode, -m      Diff mode: line (default) or char
  --ignore-whitespace   Ignore whitespace differences
  --help, -h      Show this help

Prefix a value with @ to read it from a file, e.g. --a @old.txt
`);
}

function resolveValue(v: string): string {
  if (v.startsWith('@')) {
    return readFileSync(v.slice(1), 'utf8');
  }
  return v;
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
    a: args.a,
    b: args.b,
    mode: args.m || args.mode,
    ignoreWhitespace: 'ignore-whitespace' in args,
  };
}

export async function run(argv: string[]): Promise<void> {
  if (argv.includes('--help') || argv.includes('-h') || argv.length === 0) {
    printUsage();
    return;
  }

  const { a, b, mode, ignoreWhitespace } = parseArgs(argv);
  if (!a || !b) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  const result = await tool.run({
    a: resolveValue(a),
    b: resolveValue(b),
    mode: (mode as 'line' | 'char') ?? 'line',
    ignoreWhitespace,
  });

  if (result.ok && result.data) {
    const { additions, deletions, unchanged, hunks } = result.data;
    for (const h of hunks) {
      const prefix = h.type === 'add' ? '+' : h.type === 'del' ? '-' : ' ';
      console.log(
        h.text
          .split('\n')
          .map((l) => prefix + l)
          .join('\n'),
      );
    }
    console.error(`\nadditions=${additions} deletions=${deletions} unchanged=${unchanged}`);
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
