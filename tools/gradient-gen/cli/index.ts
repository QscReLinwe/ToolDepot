#!/usr/bin/env node
import { pathToFileURL } from 'node:url';
import { tool } from '../core/index.js';

function printUsage() {
  console.log(`Usage: td-gradient-gen --type <linear|radial> --angle <deg> --stops <color:pos,...>

Arguments:
  --type, -t     Gradient type: linear | radial (default linear)
  --angle, -a    Angle in degrees for linear gradients (default 90)
  --stops, -s    Comma-separated color:position pairs (position 0-100)

Examples:
  td-gradient-gen -t linear -a 90 -s "#3b82f6:0,#8b5cf6:100"
  td-gradient-gen -t radial -s "#ff0000:0,#0000ff:100"
`);
}

function parseArgs(argv: string[]) {
  const args: Record<string, string> = {};
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
    }
  }
  return {
    type: args.t || args.type || 'linear',
    angle: args.a || args.angle,
    stops: args.s || args.stops,
  };
}

export async function run(argv: string[]): Promise<void> {
  if (argv.includes('--help') || argv.includes('-h') || argv.length === 0) {
    printUsage();
    return;
  }

  const { type, angle, stops } = parseArgs(argv);
  if (!stops) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  const stopList = stops.split(',').map((pair) => {
    const [color, pos] = pair.split(':');
    return { color: (color ?? '').trim(), position: Number(pos) };
  });

  const result = await tool.run({
    type: type as 'linear' | 'radial',
    angle: angle !== undefined ? Number(angle) : undefined,
    stops: stopList,
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
