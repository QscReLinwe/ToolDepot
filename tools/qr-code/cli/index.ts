#!/usr/bin/env node
import { pathToFileURL } from 'node:url';
import { tool } from '../core/index.js';

function printUsage() {
  console.log(`Usage: td-qr-code <text> [--size <px>] [--ecc <L|M|Q|H>] [--margin <n>]

Arguments:
  text          Text or URL to encode (required)
  --size, -s    Image size in pixels (default 256, range 32-4096)
  --ecc, -e     Error correction: L | M | Q | H (default M)
  --margin, -m  Quiet-zone margin in modules (default 4, range 0-40)

Examples:
  td-qr-code "https://example.com" -s 512 -e H
  td-qr-code "Hello World" --ecc Q --margin 2
`);
}

function parseArgs(argv: string[]) {
  const args: Record<string, string> = {};
  let text: string | undefined;
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
    } else if (text === undefined) {
      text = arg;
    }
  }
  return {
    text,
    size: args.s || args.size,
    ecc: args.e || args.ecc,
    margin: args.m || args.margin,
  };
}

export async function run(argv: string[]): Promise<void> {
  if (argv.includes('--help') || argv.includes('-h') || argv.length === 0) {
    printUsage();
    return;
  }

  const { text, size, ecc, margin } = parseArgs(argv);
  if (!text) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  const result = await tool.run({
    text,
    size: size !== undefined ? Number(size) : undefined,
    errorCorrection: ecc as never,
    margin: margin !== undefined ? Number(margin) : undefined,
  });

  if (result.ok) {
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
