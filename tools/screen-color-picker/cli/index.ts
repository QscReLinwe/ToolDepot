#!/usr/bin/env node
import { pathToFileURL } from 'node:url';
import { tool } from '../core/index.js';

function printUsage() {
  console.log(`Usage: td-screen-color-picker <color>

Convert a color string (hex or rgb) into hex/rgb/hsl.

Arguments:
  color    A color: #rgb, #rrggbb, or rgb(r, g, b)

Examples:
  td-screen-color-picker "#ff0000"
  td-screen-color-picker "rgb(0, 128, 255)"
`);
}

export async function run(argv: string[]): Promise<void> {
  if (argv.includes('--help') || argv.includes('-h') || argv.length === 0) {
    printUsage();
    return;
  }

  const color = argv.join(' ').trim();
  const result = await tool.run({ hex: color });

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
