#!/usr/bin/env node
import { pathToFileURL } from 'node:url';
import { tool } from '../core/index.js';

function printUsage() {
  console.log(`Usage: td-color-converter <color> [--from <format>]

Convert a color between hex/rgb/hsl/hsv/cmyk.

Options:
  --from, -f   Source format: auto (default) | hex | rgb | hsl | hsv | cmyk

Examples:
  td-color-converter "#ff0000"
  td-color-converter "hsl(120, 50%, 50%)" --from hsl
  td-color-converter "cmyk(0, 100, 100, 0)"
`);
}

function parseArgs(argv: string[]) {
  const args: Record<string, string> = {};
  let positional = '';
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg) continue;
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
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
    } else {
      positional += (positional ? ' ' : '') + arg;
    }
  }
  return { from: args.f || args.from, positional };
}

export async function run(argv: string[]): Promise<void> {
  if (argv.includes('--help') || argv.includes('-h') || argv.length === 0) {
    printUsage();
    return;
  }

  const { from, positional } = parseArgs(argv);
  const result = await tool.run({
    input: positional,
    from: (from as 'auto' | 'hex' | 'rgb' | 'hsl' | 'hsv' | 'cmyk' | undefined) ?? 'auto',
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
