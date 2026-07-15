#!/usr/bin/env node
import { pathToFileURL } from 'node:url';
import type { DateCalcMode } from '../core/index.js';
import { tool } from '../core/index.js';

function printUsage() {
  console.log(`Usage: td-date-calc --mode <add|subtract|diff|weekday> --start <ISO> [options]

Arguments:
  --mode, -m     Operation: add, subtract, diff, or weekday (required)
  --start, -s    Start date (ISO 8601, e.g. 2024-01-01 or 2024-01-01T10:00:00Z) (required)
  --end, -e      End date (required for diff mode)
  --days, -d     Number of days to add/subtract
  --months       Number of months to add/subtract
  --years, -y    Number of years to add/subtract
  --workdays     For diff mode, also count weekdays (Mon-Fri)

Examples:
  td-date-calc -m add -s 2024-01-01 --days 45 --months 1
  td-date-calc -m subtract -s 2024-12-31 -y 1 -d 10
  td-date-calc -m diff -s 2024-01-01 -e 2024-12-31 --workdays
  td-date-calc -m weekday -s 2024-07-04
`);
}

function parseArgs(argv: string[]): Record<string, string> {
  const args: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg) continue;
    const key = arg.startsWith('--') ? arg.slice(2) : arg.startsWith('-') && arg.length === 2 ? arg[1] : null;
    if (!key) continue;
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

  const a = parseArgs(argv);
  const modeRaw = a.mode ?? a.m;
  const startDate = a.start ?? a.s;
  const endDate = a.end ?? a.e;
  const days = num(a.days ?? a.d);
  const months = num(a.months);
  const years = num(a.years ?? a.y);
  const countWorkdays = 'workdays' in a;

  if (!modeRaw || !startDate) {
    printUsage();
    process.exitCode = 1;
    return;
  }
  if (modeRaw !== 'add' && modeRaw !== 'subtract' && modeRaw !== 'diff' && modeRaw !== 'weekday') {
    console.error("mode must be 'add', 'subtract', 'diff', or 'weekday'");
    process.exitCode = 1;
    return;
  }
  const mode = modeRaw as DateCalcMode;

  const result = await tool.run({
    mode,
    startDate,
    endDate,
    days,
    months,
    years,
    countWorkdays,
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
