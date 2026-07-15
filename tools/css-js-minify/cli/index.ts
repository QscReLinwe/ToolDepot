#!/usr/bin/env node
import { pathToFileURL } from 'node:url';
import type { MinifyMode } from '../core/index.js';
import { tool } from '../core/index.js';

function printUsage() {
  console.log(`Usage: td-css-js-minify --mode <css|js> --code "<code>" [--file <path>]

Arguments:
  --mode, -m     css|js (required)
  --code, -c     Code to minify (required unless --file is given)
  --file, -f     Read code from a file

Examples:
  td-css-js-minify -m css -c "body { color: red; }"
  td-css-js-minify -m js -f script.js
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
    code: args.code || args.c,
    file: args.file || args.f,
  };
}

export async function run(argv: string[]): Promise<void> {
  if (argv.includes('--help') || argv.includes('-h') || argv.length === 0) {
    printUsage();
    return;
  }

  const { mode, code, file } = parseArgs(argv);
  if (!mode) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  let codeValue = code;
  if (!codeValue && file) {
    try {
      const { readFileSync } = await import('node:fs');
      codeValue = readFileSync(file, 'utf8');
    } catch (e) {
      console.error(`Could not read file: ${e instanceof Error ? e.message : String(e)}`);
      process.exitCode = 1;
      return;
    }
  }
  if (!codeValue) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  const result = await tool.run({ mode: mode as MinifyMode, code: codeValue });
  if (result.ok) {
    console.log(result.data?.minified ?? '');
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
