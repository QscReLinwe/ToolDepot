#!/usr/bin/env node
import { pathToFileURL } from 'node:url';
import type { GraphQLOperation } from '../core/index.js';
import { tool } from '../core/index.js';

function printUsage() {
  console.log(`Usage: td-graphql-builder --operation <op> [--name <name>] --fields <f1,f2,...> [--vars <name:type,...>]

Arguments:
  --operation, -o   query|mutation|subscription (required)
  --name, -n       Operation name (optional)
  --fields, -f     Comma-separated fields with dot-notation nesting (required)
  --vars, -v       Comma-separated variables as name:type (optional)

Examples:
  td-graphql-builder -o query -f "user.name,user.posts.title"
  td-graphql-builder -o mutation -n CreateUser -f "user.id,user.email" -v "input:UserInput"
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
    operation: args.operation || args.o,
    name: args.name || args.n,
    fields: args.fields || args.f,
    vars: args.vars || args.v,
  };
}

export async function run(argv: string[]): Promise<void> {
  if (argv.includes('--help') || argv.includes('-h') || argv.length === 0) {
    printUsage();
    return;
  }

  const { operation, name, fields, vars } = parseArgs(argv);
  if (!operation || !fields) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  const fieldList = fields
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const variables = vars
    ? vars
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((pair) => {
          const [vname, vtype] = pair.split(':');
          return { name: (vname || '').trim(), type: (vtype || '').trim() };
        })
    : [];

  const result = await tool.run({
    operation: operation as GraphQLOperation,
    name: name || undefined,
    fields: fieldList,
    variables,
  });

  if (result.ok) {
    console.log(result.data?.query ?? '');
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
