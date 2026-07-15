#!/usr/bin/env node
import { pathToFileURL } from 'node:url';
import { tool } from '../core/index.js';

function printUsage() {
  console.log(`Usage: td-unit-converter --category <cat> --from <unit> --to <unit> --value <n>

Categories: length, mass, temperature, area, volume, speed, data, time, pressure

Options:
  --category, -c   Unit category (required)
  --from, -f       Source unit (required)
  --to, -t         Target unit (required)
  --value, -v      Value to convert (required)
  --help, -h       Show this help

Examples:
  td-unit-converter -c length -f km -t mi -v 10
  td-unit-converter -c temperature -f C -t F -v 100
  td-unit-converter -c data -f MB -t MiB -v 1
`);
}

function parseArgs(argv: string[]) {
  const args: Record<string, string> = {};
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
    }
  }
  return {
    category: args.c || args.category,
    from: args.f || args.from,
    to: args.t || args.to,
    value: args.v || args.value,
  };
}

export async function run(argv: string[]): Promise<void> {
  if (argv.includes('--help') || argv.includes('-h') || argv.length === 0) {
    printUsage();
    return;
  }

  const { category, from, to, value } = parseArgs(argv);
  if (!category || !from || !to || value === undefined) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  const result = await tool.run({
    category: category as
      | 'length'
      | 'mass'
      | 'temperature'
      | 'area'
      | 'volume'
      | 'speed'
      | 'data'
      | 'time'
      | 'pressure',
    from,
    to,
    value: Number(value),
  });

  if (result.ok && result.data) {
    console.log(`${result.data.value} ${result.data.from} = ${result.data.result} ${result.data.to}`);
    if (result.data.formula) console.error(`(${result.data.formula})`);
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
