#!/usr/bin/env node
import { pathToFileURL } from 'node:url';
import { tool } from '../core/index.js';

function printUsage() {
  console.log(`Usage: td-csv-tsv --mode <mode> --text <text> [--delimiter <delim>] [--no-header]

Modes:
  csv2tsv    Convert CSV to TSV
  tsv2csv    Convert TSV to CSV
  csv2json   Convert CSV to JSON
  json2csv   Convert JSON array to CSV

Options:
  --mode, -m        Conversion mode (required)
  --text, -t        Input text (required)
  --delimiter, -d   Field delimiter override (default ',' for csv, '\\t' for tsv)
  --no-header       Treat first row as data (no header)
  --help, -h        Show this help

Examples:
  td-csv-tsv -m csv2tsv -t "a,b\\nc,d"
  td-csv-tsv -m json2csv -t '[{"x":1},{"x":2}]'
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
    delimiter: args.d || args.delimiter,
    hasHeader: !('no-header' in args),
  };
}

export async function run(argv: string[]): Promise<void> {
  if (argv.includes('--help') || argv.includes('-h') || argv.length === 0) {
    printUsage();
    return;
  }

  const { mode, text, delimiter, hasHeader } = parseArgs(argv);
  if (!mode || !text) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  const result = await tool.run({
    mode: mode as 'csv2tsv' | 'tsv2csv' | 'csv2json' | 'json2csv',
    text,
    delimiter,
    hasHeader,
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
