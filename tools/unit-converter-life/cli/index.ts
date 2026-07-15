#!/usr/bin/env node
import { pathToFileURL } from 'node:url';
import { tool } from '../core/index.js';

function printUsage() {
  console.log(`Usage: td-unit-converter-life --category <cat> --from <unit> --to <unit> --value <n>

Categories & units:
  cooking   cup, tbsp, tsp, ml (volume) | oz, g, lb, kg (mass)
  length    inch, ft, yd, mile, cm, m, km
  area      sqft, sqm

Examples:
  td-unit-converter-life --category cooking --from cup --to ml --value 2
  td-unit-converter-life --category length --from inch --to cm --value 10
  td-unit-converter-life --category area --from sqft --to sqm --value 500
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
    category: args.category as 'cooking' | 'length' | 'area',
    from: args.from,
    to: args.to,
    value: num(args.value),
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
