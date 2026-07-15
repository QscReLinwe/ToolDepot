#!/usr/bin/env node
import { pathToFileURL } from 'node:url';
import { tool } from '../core/index.js';

function printUsage() {
  console.log(`Usage: td-text-stats [--cjk] <text>

Compute text statistics (characters, words, lines, paragraphs, reading time).

Arguments:
  text          Text to analyze (read from stdin if omitted)

Options:
  --cjk, -c     Count CJK characters as words
  --help, -h    Show this help

Examples:
  td-text-stats "The quick brown fox jumps over the lazy dog"
  td-text-stats --cjk "Pack my box with five dozen liquor jugs"
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
    cjk: args.cjk === 'true' || args.c === 'true',
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
