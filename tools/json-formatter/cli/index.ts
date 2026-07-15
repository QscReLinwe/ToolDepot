#!/usr/bin/env node
import { runCli } from '@tooldepot/cli-core';
import type { JsonFormatterInput } from '../core/index.js';
import { tool } from '../core/index.js';

await runCli<JsonFormatterInput>(process.argv.slice(2), {
  tool,
  options: [
    { flags: '--text <text>', description: 'JSON text' },
    { flags: '--mode <mode>', description: 'format | compress | validate', defaultValue: 'format' },
    { flags: '--indent <n>', description: 'Indent spaces for format mode', defaultValue: '2' },
  ],
  positionalArg: 'text',
  positionalDescription: 'JSON text (positional)',
});
