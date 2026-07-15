import type { ToolOutput } from '@tooldepot/types';
import { format, type SqlLanguage as SqlFormatterLanguage } from 'sql-formatter';

export type SqlLanguage = 'sql' | 'mysql' | 'postgresql' | 'sqlite' | 'mssql' | 'MariaDB' | 'db2' | 'plsql';

export type SqlKeywordCase = 'upper' | 'lower';

export interface SqlFormatterInput {
  sql: string;
  language?: SqlLanguage;
  keywordCase?: SqlKeywordCase;
}

export interface SqlFormatterOutput {
  formatted: string;
  error?: string;
}

/** Map the tool's public language names onto sql-formatter's accepted dialects. */
const LANGUAGE_MAP: Record<SqlLanguage, SqlFormatterLanguage> = {
  sql: 'sql',
  mysql: 'mysql',
  postgresql: 'postgresql',
  sqlite: 'sqlite',
  mssql: 'transactsql',
  MariaDB: 'mariadb',
  db2: 'db2',
  plsql: 'plsql',
};

export const tool = {
  id: 'sql-formatter',
  name: 'SQL 格式化',
  description: '格式化与美化 SQL 查询。',
  category: 'format',
  async run(input: SqlFormatterInput): Promise<ToolOutput<SqlFormatterOutput>> {
    const sql = input?.sql;
    if (!sql || typeof sql !== 'string') {
      return { ok: false, error: 'Missing required field: sql' };
    }
    const language: SqlLanguage = input?.language ?? 'sql';
    const keywordCase: SqlKeywordCase = input?.keywordCase ?? 'upper';

    if (!(language in LANGUAGE_MAP)) {
      return { ok: false, error: `Unsupported language: ${language}` };
    }

    try {
      const formatted = format(sql, {
        language: LANGUAGE_MAP[language],
        keywordCase,
      });
      return { ok: true, data: { formatted }, mimeType: 'text/plain' };
    } catch (e) {
      return {
        ok: false,
        error: e instanceof Error ? e.message : String(e),
      };
    }
  },
};

export default tool;
