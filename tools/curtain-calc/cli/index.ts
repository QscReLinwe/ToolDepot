#!/usr/bin/env node
import { pathToFileURL } from 'node:url';
import { tool } from '../core/index.js';

function printUsage() {
  console.log(`Usage: td-curtain-calc --width <cm> --height <cm> [options]

Arguments:
  --width <cm>      Window width (cm)
  --height <cm>     Window height / drop (cm)
  --fullness <n>    Pleat fullness multiple (default 2.0)
  --hem <cm>        Hem allowance added to drop (default 15)
  --fabric <cm>     Fabric bolt width (default 140)

Examples:
  td-curtain-calc --width 200 --height 250
  td-curtain-calc --width 150 --height 220 --fullness 2.5 --hem 20
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
    windowWidthCm: num(args.width),
    windowHeightCm: num(args.height),
    fullness: num(args.fullness),
    hemCm: num(args.hem),
    fabricWidthCm: num(args.fabric),
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
