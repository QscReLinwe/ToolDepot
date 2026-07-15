#!/usr/bin/env node
import { pathToFileURL } from 'node:url';
import { tool } from '../core/index.js';

function printUsage() {
  console.log(`Usage: td-paint-floor --mode <paint|floor> [options]

Modes:
  paint   Calculate paint liters. Options: --coats, --coverage (L/m², default 10)
  floor   Calculate floor boxes.  Options: --box (m² per box, default 2.0)

Area (one of):
  --area <sqm>            Area in square meters
  --length <m> --width <m>  Area from length × width in meters

Common:
  --waste <percent>       Waste allowance, default 10

Examples:
  td-paint-floor --mode paint --area 50 --coats 2
  td-paint-floor --mode floor --length 5 --width 4 --waste 15
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
  const mode = args.mode;
  if (mode !== 'paint' && mode !== 'floor') {
    console.error('Error: --mode must be "paint" or "floor"');
    process.exitCode = 1;
    return;
  }

  const result = await tool.run({
    mode,
    areaSqm: num(args.area),
    lengthM: num(args.length),
    widthM: num(args.width),
    coats: num(args.coats),
    coveragePerL: num(args.coverage),
    floorBoxSqm: num(args.box),
    wastePercent: num(args.waste),
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
