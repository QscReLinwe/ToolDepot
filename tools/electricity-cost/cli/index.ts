#!/usr/bin/env node
import { pathToFileURL } from 'node:url';
import { tool } from '../core/index.js';

function printUsage() {
  console.log(`Usage: td-electricity-cost --power <W> --hours <h/day> --price <per kWh> [options]

Arguments:
  --power <W>       Device power in watts
  --hours <h>       Hours used per day
  --price <cur>     Price per kWh
  --days <n>        Days to project (default 30)
  --currency <sym>  Currency symbol/code for display (optional)

Examples:
  td-electricity-cost --power 1500 --hours 3 --price 0.30
  td-electricity-cost --power 100 --hours 24 --price 0.15 --days 365 --currency $
`);
}

function parseArgs(argv: string[]) {
  const args: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg?.startsWith('-')) continue;
    const key = arg.replace(/^-+/, '');
    const next = argv[i + 1];
    if (next !== undefined && !next.startsWith('-')) {
      args[key] = next;
      i++;
    } else {
      args[key] = 'true';
    }
  }
  return args;
}

function num(v: string | undefined): number | undefined {
  if (v === undefined) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export async function run(argv: string[]): Promise<void> {
  if (argv.includes('--help') || argv.includes('-h') || argv.length === 0) {
    printUsage();
    return;
  }

  const args = parseArgs(argv);
  const result = await tool.run({
    powerW: num(args.power),
    hoursPerDay: num(args.hours),
    days: num(args.days),
    pricePerKwh: num(args.price),
    currency: args.currency,
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
