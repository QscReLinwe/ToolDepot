#!/usr/bin/env node
import { pathToFileURL } from 'node:url';
import type { SqlKeywordCase, SqlLanguage } from '../core/index.js';
import { tool } from '../core/index.js';

function printUsage() {
  console.log(`Usage: td-sql-formatter --sql "<query>" [--language <dialect>] [--keyword-case upper|lower]

Arguments:
  --sql, -s         SQL query to format (required)
  --language, -l    Dialect: sql|mysql|postgresql|sqlite|mssql|MariaDB|db2|plsql (default sql)
  --keyword-case, -k  upper|lower (default upper)

Examples:
  td-sql-formatter --sql "select id,name from users where active=1"
  td-sql-formatter -s "SELECT * FROM t" -l postgresql -k lower
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
    sql: args.sql || args.s,
    language: args.language || args.l,
    keywordCase: args['keyword-case'] || args.k,
  };
}

export async function run(argv: string[]): Promise<void> {
  if (argv.includes('--help') || argv.includes('-h') || argv.length === 0) {
    printUsage();
    return;
  }

  const { sql, language, keywordCase } = parseArgs(argv);
  if (!sql) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  const result = await tool.run({
    sql,
    language: (language as SqlLanguage) ?? undefined,
    keywordCase: (keywordCase as SqlKeywordCase) ?? undefined,
  });

  if (result.ok) {
    console.log(result.data?.formatted ?? '');
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
