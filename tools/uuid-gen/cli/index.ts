#!/usr/bin/env node
import { runCli } from '@tooldepot/cli-core';
import type { UuidGenInput } from '../core/index.js';
import { tool } from '../core/index.js';

await runCli<UuidGenInput>(process.argv.slice(2), {
  tool,
  options: [{ flags: '--count <n>', description: 'Number to generate (1-100)', defaultValue: '1' }],
});
