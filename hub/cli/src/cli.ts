#!/usr/bin/env node
import { isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { getTool, listTools } from '@tooldepot/hub-core';
import type { ToolDepotMeta } from '@tooldepot/types';
import { Command } from 'commander';

// The registry stores entry paths relative to the repo root
// (e.g. "tools/calc/dist/cli/index.js"). Resolve them to absolute paths at
// runtime so the registry stays portable across machines/OSes. cli.ts lives at
// hub/cli/src/cli.ts, so the repo root is three levels up.
const __dirname = fileURLToPath(new URL('.', import.meta.url));
const repoRoot = resolve(__dirname, '..', '..', '..');

// Contract for a tool's CLI entry (tool's `entry.cli` module):
//   export async function run(argv: string[]): Promise<void>
// The master dispatcher imports that module and calls run() with the
// arguments that follow `<tool>`.

async function dispatch(tool: ToolDepotMeta, rest: string[]): Promise<void> {
  if (!tool.entry.cli) {
    throw new Error(`tool "${tool.id}" has no CLI entry`);
  }
  const entryPath = isAbsolute(tool.entry.cli) ? tool.entry.cli : join(repoRoot, tool.entry.cli);
  const mod = await import(pathToFileURL(entryPath).href);
  const run =
    (mod as { run?: (argv: string[]) => Promise<void> }).run ??
    (mod as { default?: (argv: string[]) => Promise<void> }).default;
  if (typeof run !== 'function') {
    throw new Error(`tool "${tool.id}" CLI entry has no run()/default export`);
  }
  await run(rest);
}

async function main(): Promise<void> {
  const program = new Command();
  program
    .name('tooldepot')
    .description('ToolDepot master CLI - dispatch to any tool by id')
    .argument('[tool]', 'id of the tool to run')
    .allowUnknownOption()
    .action(async (toolId: string) => {
      if (!toolId) {
        const available = listTools().map((t) => t.id);
        console.error(
          available.length
            ? `available tools: ${available.join(', ')}`
            : 'available: (none registered yet - run sync-tools after adding tools)',
        );
        process.exitCode = 1;
        return;
      }
      const tool = getTool(toolId);
      if (!tool) {
        const available = listTools().map((t) => t.id);
        console.error(`tooldepot: unknown tool "${toolId}"`);
        if (available.length) {
          console.error(`available: ${available.join(', ')}`);
        } else {
          console.error('available: (none registered yet - run sync-tools after adding tools)');
        }
        process.exitCode = 1;
        return;
      }
      // Forward every argument that follows the tool id (including --flags)
      // to the tool's CLI entry. Read from process.argv directly because
      // commander's variadic argument does not capture option-style tokens.
      const rest = process.argv.slice(2);
      rest.shift();
      await dispatch(tool, rest);
    });
  await program.parseAsync(process.argv);
}

main().catch((err) => {
  console.error(`tooldepot: ${err instanceof Error ? err.message : err}`);
  process.exitCode = 1;
});
