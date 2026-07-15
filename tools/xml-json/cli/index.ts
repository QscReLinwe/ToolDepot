#!/usr/bin/env node
import { pathToFileURL } from 'node:url';
import { tool } from '../core/index.js';

function printUsage() {
  console.log(`Usage: td-xml-json --mode <mode> --text <text>

Modes:
  xml2json   Convert XML to JSON
  json2xml   Convert JSON to XML

Options:
  --mode, -m   Conversion mode (required)
  --text, -t   Input text (required)
  --help, -h   Show this help

Examples:
  td-xml-json -m xml2json -t '<root><a>1</a></root>'
  td-xml-json -m json2xml -t '{"root":{"a":"1"}}'
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
    mode: args.m || args.mode,
    text: args.t || args.text,
  };
}

export async function run(argv: string[]): Promise<void> {
  if (argv.includes('--help') || argv.includes('-h') || argv.length === 0) {
    printUsage();
    return;
  }

  const { mode, text } = parseArgs(argv);
  if (!mode || !text) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  const result = await tool.run({
    mode: mode as 'xml2json' | 'json2xml',
    text,
  });

  if (result.ok && result.data) {
    console.log(result.data.result);
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
