#!/usr/bin/env node
import { pathToFileURL } from 'node:url';
import { tool } from '../core/index.js';

function printUsage() {
  console.log(`Usage: td-currency-exchange --amount <n> --from <CODE> --to <CODE> [--rates <json>]

Arguments:
  --amount, -a     Amount to convert
  --from, -f       Source ISO currency code (e.g. USD)
  --to, -t         Target ISO currency code (e.g. EUR)
  --rates, -r      Optional JSON rate table (units per 1 USD). Defaults to a built-in SAMPLE table.

Examples:
  td-currency-exchange -a 100 -f USD -t EUR
  td-currency-exchange -a 100 -f USD -t CNY -r '{"USD":1,"CNY":7.24}'
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
    amount: args.a || args.amount,
    from: args.f || args.from,
    to: args.t || args.to,
    rates: args.r || args.rates,
  };
}

export async function run(argv: string[]): Promise<void> {
  if (argv.includes('--help') || argv.includes('-h') || argv.length === 0) {
    printUsage();
    return;
  }

  const { amount, from, to, rates } = parseArgs(argv);

  let parsedRates: Record<string, number> | undefined;
  if (rates !== undefined) {
    try {
      parsedRates = JSON.parse(rates) as Record<string, number>;
    } catch {
      console.error('Invalid --rates JSON');
      process.exitCode = 1;
      return;
    }
  }

  const result = await tool.run({
    amount: Number(amount),
    from,
    to,
    rates: parsedRates,
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
