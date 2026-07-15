#!/usr/bin/env node
import { pathToFileURL } from 'node:url';
import { tool } from '../core/index.js';

function printUsage() {
  console.log(`Usage: td-dedup-sort [--sort asc|desc|none] [--no-unique] [--no-ignore-case] [--no-remove-blank] [--numeric] <text>

Deduplicate and sort lines of text.

Arguments:
  text          Text to process (read from stdin if omitted)

Options:
  --sort, -s       Sort order: asc|desc|none (default none)
  --no-unique        Keep duplicate lines
  --no-ignore-case  Case-sensitive comparison
  --no-remove-blank  Keep blank lines
  --numeric, -n     Compare lines as numbers
  --help, -h         Show this help

Examples:
  td-dedup-sort --sort asc "banana\\napple\\napple"
  printf '3\\n1\\n2\\n1' | td-dedup-sort --sort asc --numeric
`);
}

function parseArgs(argv: string[]): { args: Record<string, string>; positional: string[] } {
  const args: Record<string, string> = {};
  const positional: string[] = [];
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
      positional.push(arg);
    }
  }
  return { args, positional };
}

export async function run(argv: string[]): Promise<void> {
  if (argv.includes('--help') || argv.includes('-h')) {
    printUsage();
    return;
  }

  const { args, positional } = parseArgs(argv);
  let text = positional.join(' ');

  if (!text && !process.stdin.isTTY) {
    text = await new Promise<string>((resolve) => {
      let data = '';
      process.stdin.setEncoding('utf8');
      process.stdin.on('data', (chunk) => (data += chunk));
      process.stdin.on('end', () => resolve(data));
    });
  }

  if (!text) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  const result = await tool.run({
    text,
    sort: (args.sort ?? args.s) as 'asc' | 'desc' | 'none' | undefined,
    unique: args['no-unique'] === 'true' ? false : undefined,
    ignoreCase: args['no-ignore-case'] === 'true' ? false : undefined,
    removeBlank: args['no-remove-blank'] === 'true' ? false : undefined,
    numeric: args.numeric === 'true' || args.n === 'true',
  });

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
