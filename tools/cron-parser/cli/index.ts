#!/usr/bin/env node
import { pathToFileURL } from 'node:url';
import { tool } from '../core/index.js';

function printUsage() {
  console.log(`Usage: td-cron-parser <expression> [--count <n>] [--timezone <tz>]

Arguments:
  expression    Standard 5-field cron expression (minute hour day-of-month month day-of-week)
  --count, -n   Number of upcoming run times to compute (default 5, max 100)
  --timezone    Optional IANA timezone label (informational)

Examples:
  td-cron-parser "*/15 * * * *"
  td-cron-parser "0 9 * * 1-5" --count 10
  td-cron-parser "0 0 1 1 *" --timezone Europe/London
`);
}

function parseArgs(argv: string[]) {
  const args: Record<string, string> = {};
  let expression: string | undefined;
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
    } else if (expression === undefined) {
      expression = arg;
    }
  }
  return {
    expression,
    count: args.count || args.n,
    timezone: args.timezone,
  };
}

export async function run(argv: string[]): Promise<void> {
  if (argv.includes('--help') || argv.includes('-h') || argv.length === 0) {
    printUsage();
    return;
  }

  const { expression, count, timezone } = parseArgs(argv);
  if (!expression) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  const result = await tool.run({
    expression,
    count: count ? Number(count) : undefined,
    timezone: timezone,
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
