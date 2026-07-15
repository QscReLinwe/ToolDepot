#!/usr/bin/env node
import { autoRun } from '@tooldepot/cli-core';
import { tool } from '../core/index.js';

autoRun(tool, {
  options: [
    { flags: '--text <text>', description: 'Text to convert' },
    { flags: '--from <style>', description: 'camel | snake | pascal | kebab', defaultValue: 'camel' },
    { flags: '--to <style>', description: 'camel | snake | pascal | kebab', defaultValue: 'snake' },
  ],
  positionalArg: 'text',
  positionalDescription: 'Text to convert (positional)',
});
