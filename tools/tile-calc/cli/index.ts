#!/usr/bin/env node
import { pathToFileURL } from 'node:url';
import { tool } from '../core/index.js';

function printUsage() {
  console.log(`Usage: td-tile-calc --area <sqm> --length <cm> --width <cm> [options]

Arguments:
  --area <sqm>       Area to tile (square meters)
  --length <cm>      Tile length (cm)
  --width <cm>       Tile width (cm)
  --grout <mm>       Grout line width (mm, default 0)
  --waste <percent>  Waste allowance (default 10)
  --box <count>      Tiles per box (optional, enables box count)

Examples:
  td-tile-calc --area 20 --length 30 --width 30 --grout 3
  td-tile-calc --area 12 --length 60 --width 60 --waste 15 --box 4
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
    areaSqm: num(args.area),
    tileLengthCm: num(args.length),
    tileWidthCm: num(args.width),
    groutMm: num(args.grout),
    wastePercent: num(args.waste),
    boxSize: num(args.box),
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
