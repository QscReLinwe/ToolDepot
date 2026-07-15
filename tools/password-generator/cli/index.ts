#!/usr/bin/env node
import { pathToFileURL } from 'node:url';
import { tool } from '../core/index.js';

function printUsage() {
  console.log(`Usage: td-password-generator [--length <n>] [--count <n>] [options]

Options:
  --length, -l       Password length (default 16, max 512)
  --count, -c        Number of passwords (default 1, max 1000)
  --no-upper         Disable uppercase letters
  --no-lower         Disable lowercase letters
  --no-digits        Disable digits
  --no-symbols       Disable symbols
  --exclude-similar  Exclude ambiguous characters (i,l,1,L,o,O,0,I,|)
  --help, -h         Show this help

Examples:
  td-password-generator -l 20 -c 3
  td-password-generator --no-symbols --exclude-similar
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
    length: args.l || args.length,
    count: args.c || args.count,
    uppercase: !('no-upper' in args),
    lowercase: !('no-lower' in args),
    digits: !('no-digits' in args),
    symbols: !('no-symbols' in args),
    excludeSimilar: 'exclude-similar' in args,
  };
}

export async function run(argv: string[]): Promise<void> {
  if (argv.includes('--help') || argv.includes('-h')) {
    printUsage();
    return;
  }

  const { length, count, uppercase, lowercase, digits, symbols, excludeSimilar } = parseArgs(argv);

  const result = await tool.run({
    length: length !== undefined ? Number(length) : undefined,
    count: count !== undefined ? Number(count) : undefined,
    uppercase,
    lowercase,
    digits,
    symbols,
    excludeSimilar,
  });

  if (result.ok && result.data) {
    for (const pw of result.data.passwords) {
      console.log(pw);
    }
    console.error(`\nentropy=${result.data.entropy} bits`);
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
