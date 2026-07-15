#!/usr/bin/env node
import { pathToFileURL } from 'node:url';
import type { EntityMode } from '../core/index.js';
import { tool } from '../core/index.js';

function printUsage() {
  console.log(`Usage: td-html-entity --mode <encode|decode> --text "<text>" [--file <path>] [--numeric]

Arguments:
  --mode, -m     encode|decode (required)
  --text, -t     Text to process (required unless --file is given)
  --file, -f     Read text from a file
  --numeric, -n  Use numeric entities instead of named (encode only)

Examples:
  td-html-entity -m encode -t "Tom & Jerry <3"
  td-html-entity -m decode -t "Tom &amp; Jerry &lt;3"
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
    text: args.text || args.t,
    file: args.file || args.f,
    numeric: args.numeric === 'true' || args.n === 'true',
  };
}

export async function run(argv: string[]): Promise<void> {
  if (argv.includes('--help') || argv.includes('-h') || argv.length === 0) {
    printUsage();
    return;
  }

  const { mode, text, file, numeric } = parseArgs(argv);
  if (!mode) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  let textValue = text;
  if (!textValue && file) {
    try {
      const { readFileSync } = await import('node:fs');
      textValue = readFileSync(file, 'utf8');
    } catch (e) {
      console.error(`Could not read file: ${e instanceof Error ? e.message : String(e)}`);
      process.exitCode = 1;
      return;
    }
  }
  if (!textValue) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  const result = await tool.run({ mode: mode as EntityMode, text: textValue, named: !numeric });
  if (result.ok) {
    console.log(result.data?.result ?? '');
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
