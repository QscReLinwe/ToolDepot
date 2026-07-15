#!/usr/bin/env node
import { pathToFileURL } from 'node:url';
import { tool } from '../core/index.js';

function printUsage() {
  console.log(`Usage: td-mortgage --principal <n> --rate <pct> --years <n> [--down <n>] [--extra <n>]

Arguments:
  --principal, -p   Home price (or loan amount if no down payment)
  --rate, -r        Annual nominal rate in percent (e.g. 6 for 6%)
  --years, -y       Loan term in years
  --down, -d        Optional down payment
  --extra, -e       Optional extra monthly principal payment

Examples:
  td-mortgage -p 300000 -r 6 -y 30
  td-mortgage -p 300000 -r 6 -y 30 -d 60000 -e 200
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
    principal: args.p || args.principal,
    rate: args.r || args.rate,
    years: args.y || args.years,
    down: args.d || args.down,
    extra: args.e || args.extra,
  };
}

export async function run(argv: string[]): Promise<void> {
  if (argv.includes('--help') || argv.includes('-h') || argv.length === 0) {
    printUsage();
    return;
  }

  const { principal, rate, years, down, extra } = parseArgs(argv);

  const result = await tool.run({
    principal: Number(principal),
    annualRate: Number(rate),
    years: Number(years),
    downPayment: down !== undefined ? Number(down) : undefined,
    extraMonthly: extra !== undefined ? Number(extra) : undefined,
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
