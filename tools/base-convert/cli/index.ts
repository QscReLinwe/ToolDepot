#!/usr/bin/env node
import { autoRun } from '@tooldepot/cli-core';
import { tool } from '../core/index.js';

autoRun(tool, {
  options: [
    { flags: '--value <value>', description: 'Value to convert' },
    { flags: '--from <n>', description: 'Source base (2-36), default 10', defaultValue: '10' },
    { flags: '--to <n>', description: 'Target base (2-36), default 16', defaultValue: '16' },
  ],
  positionalArg: 'value',
  positionalDescription: 'Value to convert (positional)',
});
