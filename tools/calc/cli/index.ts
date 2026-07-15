#!/usr/bin/env node
import { runCli } from '@tooldepot/cli-core';
import type { CalcInput } from '../core/index.js';
import { tool } from '../core/index.js';

await runCli<CalcInput>(process.argv.slice(2), {
  tool,
  options: [{ flags: '--expr <expression>', description: 'Arithmetic expression' }],
  positionalArg: 'expression',
  positionalDescription: 'Arithmetic expression (positional)',
});
