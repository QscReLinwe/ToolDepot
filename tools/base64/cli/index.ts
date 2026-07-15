#!/usr/bin/env node
import { runCli } from '@tooldepot/cli-core';
import type { Base64Input } from '../core/index.js';
import { tool } from '../core/index.js';

await runCli<Base64Input>(process.argv.slice(2), {
  tool,
  options: [
    { flags: '--text <text>', description: 'text to encode / decode' },
    { flags: '--mode <mode>', description: 'encode | decode', defaultValue: 'encode' },
  ],
  positionalArg: 'text',
  positionalDescription: 'text to encode / decode (positional)',
});
