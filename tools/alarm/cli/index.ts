#!/usr/bin/env node
import { pathToFileURL } from 'node:url';
import { tool } from '../core/index.js';

function printUsage() {
  console.log(`Usage: td-alarm <time>

 Set an alarm that triggers a reminder at the specified time

Arguments:
   <time>      Trigger time, supported formats:
             HH:mm         - that time today/tomorrow (e.g. 07:30)
             YYYY-MM-DDTHH:mm - specific date and time (e.g. 2024-12-25T09:00)

Examples:
   td-alarm 07:30
   td-alarm 2024-12-25T09:00
 `);
}

export async function run(argv: string[]): Promise<void> {
  if (argv.includes('--help') || argv.includes('-h') || argv.length === 0) {
    printUsage();
    return;
  }

  const time = argv[0]!;

  const result = await tool.run({ time });

  if (result.ok && result.data) {
    console.log(`Alarm set: ${result.data.text}`);
    console.log(`Trigger time: ${new Date(result.data.triggerTime).toLocaleString()}`);
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
