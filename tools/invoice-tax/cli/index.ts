#!/usr/bin/env node
import { pathToFileURL } from 'node:url';
import { tool } from '../core/index.js';

function printUsage() {
  console.log(`Usage: td-invoice-tax --tax <rate> [--subtotal <subtotal>] [--discount <discount>] [--lines <json>] [--currency <currency code>]

Arguments:
   --tax, -t         Tax rate percentage (e.g. 8 means 8%)
   --subtotal, -s    Precomputed subtotal (used when --lines is omitted)
   --discount, -d    Discount amount (absolute value)
   --lines, -l       Line items JSON array [{ name, qty, unitPrice }]
   --currency, -c    Optional currency code

Examples:
   td-invoice-tax -t 8 -s 1000 -d 50
   td-invoice-tax -t 8 -l '[{"name":"Item","qty":3,"unitPrice":10}]'
 `);
}

function parseArgs(argv: string[]) {
  const args: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg) continue;
    const key = arg.startsWith('--') ? arg.slice(2) : arg.startsWith('-') ? arg.slice(1) : null;
    if (!key) continue;
    const next = argv[i + 1];
    if (next !== undefined && !next.startsWith('-')) {
      args[key] = next;
      i++;
    } else {
      args[key] = 'true';
    }
  }
  return {
    tax: args.t || args.tax,
    subtotal: args.s || args.subtotal,
    discount: args.d || args.discount,
    lines: args.l || args.lines,
    currency: args.c || args.currency,
  };
}

export async function run(argv: string[]): Promise<void> {
  if (argv.includes('--help') || argv.includes('-h') || argv.length === 0) {
    printUsage();
    return;
  }

  const { tax, subtotal, discount, lines, currency } = parseArgs(argv);

  let parsedLines: { name: string; qty: number; unitPrice: number }[] | undefined;
  if (lines !== undefined) {
    try {
      parsedLines = JSON.parse(lines) as { name: string; qty: number; unitPrice: number }[];
    } catch {
      console.error('Invalid --lines JSON');
      process.exitCode = 1;
      return;
    }
  }

  const result = await tool.run({
    taxRate: Number(tax),
    subtotal: subtotal !== undefined ? Number(subtotal) : undefined,
    discount: discount !== undefined ? Number(discount) : undefined,
    lines: parsedLines,
    currency: currency,
  });

  if (result.ok) {
    console.log(JSON.stringify(result.data, null, 2));
  } else {
    console.error(result.error ?? 'Unknown error');
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
