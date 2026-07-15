#!/usr/bin/env node
import { runCli } from '@tooldepot/cli-core';
import type { UrlCodecInput } from '../core/index.js';
import { tool } from '../core/index.js';

await runCli<UrlCodecInput>(process.argv.slice(2), {
  tool,
  options: [
    { flags: '--text <text>', description: 'Text to encode/decode' },
    { flags: '--mode <mode>', description: 'encode | decode', defaultValue: 'encode' },
  ],
  positionalArg: 'text',
  positionalDescription: 'Text to encode/decode (positional)',
});
