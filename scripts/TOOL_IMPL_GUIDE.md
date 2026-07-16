# ToolDepot — Tool Implementation Guide (for subagents)

Project: **ToolDepot** — a pnpm monorepo at `D:\Project\OpenCodeProject\ToolDepot`.
Tools live in `tools/<id>/`. Each tool is a package with 4 entry points.

## 1. Scaffold

There is no generator script. From repo root, copy the template package and rename it:
```
cp -r tools/_template tools/<id>
```
This creates `tools/<id>/` with template `package.json`, `tsconfig.json`, `core/index.ts`, `cli/index.ts`, `desktop/index.tsx`. **Then OVERWRITE those 4–5 files with real implementations** (the template is a stub). Also edit `tools/<id>/package.json` to set `name`, `bin`, `exports` paths, and `tooldepot.id/name/description/category/bin` (see §5).

> Note: `scripts/create-tool.mjs` does not exist. Scaffolding is done by copying `tools/_template` as shown above.

`id` = kebab-case (e.g. `bmi-bfr-bmr`). `category` ∈ `format|encode|convert|generate|crypto|utility|dev` (or any string).

## 2. Core — `tools/<id>/core/index.ts`

```ts
import type { Tool, ToolOutput } from '@tooldepot/types';

export interface <Name>Input {
  // all input fields, optional where sensible
}
export interface <Name>Output {
  // result fields
}

export const tool = {
  id: '<id>',
  name: '<Name>',
  description: '<description>',
  category: '<category>',
  async run(input: <Name>Input): Promise<ToolOutput<<Name>Output>> {
    // validate input; on bad/expected-invalid input return { ok: false, error: '...' }
    // NEVER throw for expected bad input
    return { ok: true, data: { /* ... */ }, mimeType: 'application/json' };
  },
};
export default tool;
```
Use `input?.field` defensive access. Keep core **pure** (no DOM, no React). Core must run in Node (CLI) and browser (desktop).

## 3. CLI — `tools/<id>/cli/index.ts`

- Start with `#!/usr/bin/env node`.
- `import { tool } from '../core/index.js';`
- Parse `process.argv.slice(2)` with a simple loop. Support `--help`/`-h` (print usage, return).
- Call `await tool.run({ ... })`, `console.log(JSON.stringify(result.data, null, 2))` on success, `console.error(result.error)` + `process.exitCode = 1` on failure.
- Guard direct invocation:
  ```ts
  import { pathToFileURL } from 'node:url';
  const invokedDirectly = import.meta.url === pathToFileURL(process.argv[1] ?? '').href;
  if (invokedDirectly) { run(process.argv.slice(2)).catch((e) => { console.error(e); process.exitCode = 1; }); }
  ```
- bin name = `td-<id>`.

## 4. Desktop — `tools/<id>/desktop/index.tsx`

```tsx
import React, { useState } from 'react';
import type { ToolViewProps } from '@tooldepot/types';
import type { <Name>Input, <Name>Output } from '../core/index.js';

export const Component: React.FC<ToolViewProps<<Name>Input, <Name>Output>> = ({ tool, initialInput, onResult }) => {
  // useState for each input (seed from initialInput), useState for result/error/loading
  // run() calls await tool.run({...}), sets result or error
  // render labeled inputs (className="tool-input"/"tool-select"), a button (className="tool-btn"),
  // error block (className="tool-error"), result block (className="tool-result")
};
export default Component;
```
Use inline `style={{}}` (no external CSS files). Mirror `tools/timezone-converter/desktop/index.tsx` for layout/styling conventions.

## 5. package.json — `tools/<id>/package.json`

Copy `tools/timezone-converter/package.json`, change `name`, `bin`, `exports` paths, `tooldepot.id/name/description/category/bin`. Keep `"@tooldepot/types": "workspace:*"` in dependencies. Add runtime deps only if a library is genuinely required (e.g. `qrcode`, `marked`, `sql-formatter`, `fast-xml-parser`, `diff`). devDependencies stay as in the template.

## 6. Hard constraints

- **NO** `as any`, `@ts-ignore`, `@ts-expect-error`. Use real types.
- **NO** throwing for expected bad input — return `{ ok: false, error }`.
- **DO NOT** run `pnpm install` or `pnpm -r typecheck` (lockfile race with sibling agents). Just write correct, type-clean code. Central step installs + typechecks.
- Prefer PURE TypeScript; avoid new npm deps unless necessary (then list in `dependencies`).
- Every tool must be **fully functional** (real logic), never a placeholder/TODO.
- Browser-only APIs (FileReader, EyeDropper, canvas) belong ONLY in `desktop/index.tsx`, never in `core`.

## 7. Reference (read these first)

`tools/timezone-converter/core/index.ts`, `cli/index.ts`, `desktop/index.tsx`, `package.json` — canonical working example.
`packages/types/src/index.ts` — `Tool`, `ToolOutput`, `ToolViewProps`, `ToolCategory` definitions.
