#!/usr/bin/env node
import { pathToFileURL } from 'node:url';
import { tool } from '../core/index.js';

function printUsage() {
  console.log(`Usage: td-password-strength <password>

Analyze password strength and entropy.

Arguments:
  password    Password to analyze (read from stdin if omitted)

Options:
  --help, -h  Show this help

Examples:
  td-password-strength "hunter2!"
  echo "hunter2!" | td-password-strength
`);
}

export async function run(argv: string[]): Promise<void> {
  if (argv.includes('--help') || argv.includes('-h')) {
    printUsage();
    return;
  }

  let password = argv.join(' ');

  if (!password && !process.stdin.isTTY) {
    password = await new Promise<string>((resolve) => {
      let data = '';
      process.stdin.setEncoding('utf8');
      process.stdin.on('data', (chunk) => (data += chunk));
      process.stdin.on('end', () => resolve(data.replace(/\r?\n$/, '')));
    });
  }

  if (!password) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  const result = await tool.run({ password });

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
