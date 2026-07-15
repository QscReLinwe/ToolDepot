#!/usr/bin/env node
import { pathToFileURL } from 'node:url';
import { tool } from '../core/index.js';

function printUsage() {
  console.log(`Usage: td-compound-interest --principal <n> --rate <pct> --years <n> --compounds <1|4|12|365> [--contribution <n>] [--at start|end]

Arguments:
  --principal, -p     Initial lump sum
  --rate, -r          Annual nominal rate in percent (e.g. 5 for 5%)
  --years, -y         Number of years
  --compounds, -c     Compounding frequency per year: 1, 4, 12, or 365
  --contribution, -m  Optional monthly contribution
  --at, -a            Contribution timing: start or end (default end)

Examples:
  td-compound-interest -p 1000 -r 5 -y 10 -c 12
  td-compound-interest -p 1000 -r 5 -y 10 -c 12 -m 100 -a start
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
    compounds: args.c || args.compounds,
    contribution: args.m || args.contribution,
    at: args.a || args.at,
  };
}

export async function run(argv: string[]): Promise<void> {
  if (argv.includes('--help') || argv.includes('-h') || argv.length === 0) {
    printUsage();
    return;
  }

  const { principal, rate, years, compounds, contribution, at } = parseArgs(argv);

  const result = await tool.run({
    principal: Number(principal),
    annualRate: Number(rate),
    years: Number(years),
    compoundsPerYear: Number(compounds),
    monthlyContribution: contribution !== undefined ? Number(contribution) : undefined,
    contributionAt: (at as 'start' | 'end' | undefined) ?? undefined,
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
