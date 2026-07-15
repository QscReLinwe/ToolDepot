#!/usr/bin/env node
import { pathToFileURL } from 'node:url';
import { tool } from '../core/index.js';

function printUsage() {
  console.log(`Usage: td-placeholder-text --count <n> --unit <unit> [--no-lorem] [--lang en|zh]

Options:
  --count, -c     Number of units to generate (required)
  --unit, -u      Unit: words | sentences | paragraphs (default paragraphs)
  --no-lorem     Do not start English text with "Lorem ipsum..."
  --lang, -l     Language: en (default) | zh
  --help, -h     Show this help

Examples:
  td-placeholder-text -c 3 -u paragraphs
  td-placeholder-text -c 5 -u sentences --lang zh
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
    count: args.c || args.count,
    unit: args.u || args.unit || 'paragraphs',
    startWithLorem: !('no-lorem' in args),
    language: (args.l || args.lang || 'en') as 'en' | 'zh',
  };
}

export async function run(argv: string[]): Promise<void> {
  if (argv.includes('--help') || argv.includes('-h') || argv.length === 0) {
    printUsage();
    return;
  }

  const { count, unit, startWithLorem, language } = parseArgs(argv);
  if (!count) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  const result = await tool.run({
    count: Number(count),
    unit: unit as 'words' | 'sentences' | 'paragraphs',
    startWithLorem,
    language,
  });

  if (result.ok && result.data) {
    console.log(result.data.text);
    console.error(`\n(${result.data.words} words)`);
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
