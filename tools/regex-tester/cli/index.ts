#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { tool } from '../core/index.js';

function printUsage() {
  console.log(`Usage: td-regex-tester --pattern <regex> [--flags <flags>] [--replace <str>] [--text <text> | --file <path>]

Test a regular expression against text.

Options:
  --pattern, -p   Regex pattern (required)
  --flags, -f     Regex flags, e.g. gi
  --replace, -r   Replacement string (applies String.replace)
  --text, -t      Input text
  --file, -l      Read input text from a file
  --help, -h      Show this help

Examples:
  td-regex-tester -p "\\\\d+" -t "a1 b22 c333"
  td-regex-tester -p "(\\\\w+)@(\\\\w+)" -f g -r "$1(at)$2" -t "a@b c@d"
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
    pattern: args.p || args.pattern,
    flags: args.f || args.flags,
    replace: args.r || args.replace,
    text: args.t || args.text,
    file: args.l || args.file,
  };
}

export async function run(argv: string[]): Promise<void> {
  if (argv.includes('--help') || argv.includes('-h') || argv.length === 0) {
    printUsage();
    return;
  }

  const { pattern, flags, replace, text, file } = parseArgs(argv);
  if (!pattern) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  const inputText = text !== undefined ? text : file ? readFileSync(file, 'utf8') : '';

  const result = await tool.run({
    pattern,
    flags,
    text: inputText,
    replace,
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
