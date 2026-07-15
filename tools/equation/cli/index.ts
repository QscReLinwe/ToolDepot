#!/usr/bin/env node
import { runCli } from '@tooldepot/cli-core';
import type { EquationInput } from '../core/index.js';
import { tool } from '../core/index.js';

await runCli<EquationInput>(process.argv.slice(2), {
  tool,
  options: [{ flags: '--equation <expr>', description: 'Equation, e.g. "x^2 - 4 = 0"' }],
  positionalArg: 'equation',
  positionalDescription: 'Equation (positional)',
});
