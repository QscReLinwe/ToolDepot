#!/usr/bin/env node
import { pathToFileURL } from 'node:url';
import { tool } from '../core/index.js';

function printUsage() {
  console.log(`Usage: td-pomodoro [--work <min>] [--break <min>] [--long-break <min>] [--rounds <n>]

Generate a Pomodoro work/break schedule.

Options:
  --work, -w        Work duration in minutes (default 25)
  --break, -b       Short break duration in minutes (default 5)
  --long-break, -l  Long break duration in minutes (default 15)
  --rounds, -r      Number of work rounds before a long break (default 4)
  --help, -h        Show this help

Examples:
  td-pomodoro
  td-pomodoro --work 50 --break 10 --rounds 3
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

export async function run(argv: string[]): Promise<void> {
  if (argv.includes('--help') || argv.includes('-h')) {
    printUsage();
    return;
  }

  const args = parseArgs(argv);
  const num = (v: string | undefined, fallback: number): number => (v === undefined ? fallback : Number(v));

  const result = await tool.run({
    workMin: num(args.work ?? args.w, 25),
    breakMin: num(args.break ?? args.b, 5),
    longBreakMin: num(args['long-break'] ?? args.l, 15),
    rounds: num(args.rounds ?? args.r, 4),
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
