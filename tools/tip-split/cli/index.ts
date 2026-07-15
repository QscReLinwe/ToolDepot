#!/usr/bin/env node
import { pathToFileURL } from 'node:url';
import { tool } from '../core/index.js';

function printUsage() {
  console.log(`Usage: td-tip-split --bill <n> --tip <pct> --people <n> [--round-up] [--currency <code>]

Arguments:
  --bill, -b       Pre-tip bill amount
  --tip, -t        Tip percentage (e.g. 15 for 15%)
  --people, -p     Number of people to split among
  --round-up, -r   Round each person's share up to the next whole unit
  --currency, -c   Optional currency code

Examples:
  td-tip-split -b 100 -t 15 -p 3
  td-tip-split -b 100 -t 15 -p 3 --round-up
`);
}

function parseArgs(argv: string[]) {
  const args: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg) continue;
    const key = arg.startsWith('--') ? arg.slice(2) : arg.startsWith('-') ? arg.slice(1) : null;
    if (!key) continue;
    const next = argv[i + 1];
    if (next !== undefined && !next.startsWith('-')) {
      args[key] = next;
      i++;
    } else {
      args[key] = 'true';
    }
  }
  return {
    bill: args.b || args.bill,
    tip: args.t || args.tip,
    people: args.p || args.people,
    roundUp: args.r || args['round-up'],
    currency: args.c || args.currency,
  };
}

export async function run(argv: string[]): Promise<void> {
  if (argv.includes('--help') || argv.includes('-h') || argv.length === 0) {
    printUsage();
    return;
  }

  const { bill, tip, people, roundUp, currency } = parseArgs(argv);

  const result = await tool.run({
    bill: Number(bill),
    tipPercent: Number(tip),
    people: Number(people),
    roundUp: roundUp === 'true',
    currency: currency,
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
