#!/usr/bin/env node
import { autoRun } from '@tooldepot/cli-core';
import { tool } from '../core/index.js';

autoRun(tool, {
  options: [
    { flags: '--text <text>', description: 'Text to hash' },
    { flags: '--algorithm <algo>', description: 'sha1 | sha256 | sha512', defaultValue: 'sha256' },
  ],
  positionalArg: 'text',
  positionalDescription: 'Text to hash (positional)',
});
