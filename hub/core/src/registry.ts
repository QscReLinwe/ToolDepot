import type { ToolDepotMeta } from '@tooldepot/types';
import { toolRegistry } from './tool-registry.generated.js';

export function listTools(): ToolDepotMeta[] {
  return toolRegistry;
}

export function getTool(id: string): ToolDepotMeta | undefined {
  return toolRegistry.find((t) => t.id === id);
}

export function resolveCoreEntry(id: string): string | undefined {
  return getTool(id)?.entry.core;
}
