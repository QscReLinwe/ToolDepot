#!/usr/bin/env node
import { pathToFileURL } from 'node:url';
import { tool } from '../core/index.js';

function printUsage() {
  console.log(`Usage: td-random-picker --mode <mode> --items <a,b,c> [--count <n>] [--group-size <n>]

Arguments:
  --items, -i   Comma- or newline-separated list of items
  --mode, -m    pick-one | pick-n | shuffle | groups
  --count, -c   Number of items for pick-n (default 1)
  --group-size  Group size for groups mode (default 2)

Examples:
  td-random-picker -m pick-one -i "Alice,Bob,Carol"
  td-random-picker -m pick-n -c 2 -i "a,b,c,d,e"
  td-random-picker -m groups --group-size 2 -i "a,b,c,d"
`);
}

function parseArgs(argv: string[]) {
  const args: Record<string, string> = {};
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
    }
  }
  return {
    items: args.i || args.items,
    mode: args.m || args.mode,
    count: args.c || args.count,
    groupSize: args['group-size'],
  };
}

export async function run(argv: string[]): Promise<void> {
  if (argv.includes('--help') || argv.includes('-h') || argv.length === 0) {
    printUsage();
    return;
  }

  const { items, mode, count, groupSize } = parseArgs(argv);
  if (!items || !mode) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  const result = await tool.run({
    text: items,
    mode: mode as never,
    count: count !== undefined ? Number(count) : undefined,
    groupSize: groupSize !== undefined ? Number(groupSize) : undefined,
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
