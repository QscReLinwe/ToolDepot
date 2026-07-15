#!/usr/bin/env node
import { pathToFileURL } from 'node:url';
import { tool } from '../core/index.js';

function printUsage() {
  console.log(`Usage: td-countdown <duration>

 Simple countdown timer

Arguments:
   <duration>    Countdown duration, supported formats:
             25m        - 25 minutes
             1h30m      - 1 hour 30 minutes
             1:30:00    - 1 hour 30 minutes 0 seconds
             90         - 90 seconds
             90s        - 90 seconds

Examples:
   td-countdown 25m
   td-countdown 1h30m
   td-countdown 1:30:00
   td-countdown 90
 `);
}

export async function run(argv: string[]): Promise<void> {
  if (argv.includes('--help') || argv.includes('-h') || argv.length === 0) {
    printUsage();
    return;
  }

  const duration = argv[0]!;

  const result = await tool.run({ duration });

  if (result.ok && result.data) {
    console.log(`Countdown: ${result.data.formatted}`);
    console.log(`End time: ${new Date(result.data.endTime).toLocaleString()}`);
  } else {
    console.error(`Error: ${result.error}`);
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
