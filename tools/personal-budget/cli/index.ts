#!/usr/bin/env node
import { pathToFileURL } from 'node:url';
import { tool } from '../core/index.js';

function printUsage() {
  console.log(`Usage: td-personal-budget --income <json> --expenses <json>

Arguments:
   --income, -i     Income JSON array [{ name, amount }]
   --expenses, -e   Expenses JSON array [{ name, amount, category? }]

Examples:
   td-personal-budget -i '[{"name":"Salary","amount":4000}]' -e '[{"name":"Rent","amount":1500,"category":"Housing"}]'
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
    income: args.i || args.income,
    expenses: args.e || args.expenses,
  };
}

export async function run(argv: string[]): Promise<void> {
  if (argv.includes('--help') || argv.includes('-h') || argv.length === 0) {
    printUsage();
    return;
  }

  const { income, expenses } = parseArgs(argv);

  let parsedIncome: { name: string; amount: number }[] = [];
  let parsedExpenses: { name: string; amount: number; category?: string }[] = [];
  try {
    if (income !== undefined) parsedIncome = JSON.parse(income);
    if (expenses !== undefined) parsedExpenses = JSON.parse(expenses);
  } catch {
    console.error('Invalid --income or --expenses JSON');
    process.exitCode = 1;
    return;
  }

  const result = await tool.run({
    income: parsedIncome,
    expenses: parsedExpenses,
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
