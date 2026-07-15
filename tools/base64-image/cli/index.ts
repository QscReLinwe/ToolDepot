#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { tool } from '../core/index.js';

function printUsage() {
  console.log(`Usage: td-base64-image --mode <encode|decode> [--file <path> | <data>]

Encode/decode images to/from base64 data URLs.

Options:
  --mode, -m    encode | decode (required)
  --file, -f    Read input from a file (encode: image file; decode: .b64 text)
  --help, -h    Show this help

Examples:
  td-base64-image -m encode -f logo.png
  td-base64-image -m decode "iVBORw0KGgo..." > out.b64
`);
}

function parseArgs(argv: string[]) {
  const args: Record<string, string> = {};
  let positional = '';
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg) continue;
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
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
    } else {
      positional += (positional ? ' ' : '') + arg;
    }
  }
  return { mode: args.m || args.mode, file: args.f || args.file, positional };
}

export async function run(argv: string[]): Promise<void> {
  if (argv.includes('--help') || argv.includes('-h') || argv.length === 0) {
    printUsage();
    return;
  }

  const { mode, file, positional } = parseArgs(argv);
  if (mode !== 'encode' && mode !== 'decode') {
    printUsage();
    process.exitCode = 1;
    return;
  }

  let data = positional;
  if (file) {
    const buf = readFileSync(file);
    data = mode === 'encode' ? `data:application/octet-stream;base64,${buf.toString('base64')}` : buf.toString('utf8');
  }

  const result = await tool.run({ mode: mode as 'encode' | 'decode', data });

  if (result.ok && result.data) {
    console.log(JSON.stringify(result.data, null, 2));
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
