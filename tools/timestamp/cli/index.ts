#!/usr/bin/env node
import { autoRun } from '@tooldepot/cli-core';
import { tool } from '../core/index.js';

autoRun(tool, {
  options: [
    { flags: '--value <value>', description: 'Timestamp or date string' },
    { flags: '--mode <mode>', description: 'to-date | to-timestamp', defaultValue: 'to-date' },
    { flags: '--unit <unit>', description: 's | ms', defaultValue: 'ms' },
  ],
  positionalArg: 'value',
  positionalDescription: 'Timestamp or date string (positional)',
});
