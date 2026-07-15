/**
 * Shared contract for all ToolDepot tools and the hub that hosts them.
 * Consumed by tool packages (core/cli/desktop) and by hub (registry/loader).
 */

/** Tool categorization. Closed set for first batch; open to arbitrary strings for future tools. */
export type ToolCategory = 'format' | 'encode' | 'convert' | 'generate' | 'crypto' | 'utility' | 'dev' | (string & {});

/** Arbitrary input map passed to a tool's run(). Concrete tools narrow this via generics. */
export type ToolInput = Record<string, unknown>;

/** Normalized result returned by every tool. */
export interface ToolOutput<O = unknown> {
  /** Whether the operation succeeded. */
  ok: boolean;
  /** Typed payload on success. */
  data?: O;
  /** Human-readable error on failure. */
  error?: string;
  /** Optional hint for desktop rendering (e.g. 'text/plain', 'application/json'). */
  mimeType?: string;
  /** Optional suggested filename when the result is downloadable. */
  filename?: string;
}

/**
 * A tool's core implementation. Tools export a single Tool from their core/ entry.
 */
export interface Tool<I = ToolInput, O = unknown> {
  /** Stable machine id, e.g. 'json-formatter'. */
  id: string;
  /** Display name shown in the hub UI. */
  name: string;
  /** Short description. */
  description: string;
  /** Category used for grouping in the hub. */
  category: ToolCategory;
  /** Run the tool. Must never throw for expected bad input — return ok:false instead. */
  run(input: I): Promise<ToolOutput<O>>;
}

/** Props passed to a tool's desktop React component (exported from desktop/ entry). */
export interface ToolViewProps<I = ToolInput, O = unknown> {
  /** The tool descriptor (id/name/description/category). */
  tool: Tool<I, O>;
  /** Optional pre-filled input when launched from the hub. */
  initialInput?: I;
  /** Called by the component when a run completes, so the hub can show history. */
  onResult?: (output: ToolOutput<O>) => void;
}

/**
 * The tooldepot metadata block embedded in every tool's package.json.
 * The hub's sync-tools script reads this to build the registry.
 */
export interface ToolDepotMeta {
  /** Must match Tool.id. */
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  /** Entry points resolved by the hub loader (paths relative to the tool package root). */
  entry: {
    /** Module exporting the default Tool. */
    core: string;
    /** Commander CLI entry (also referenced by bin). Optional — not all tools expose a CLI. */
    cli?: string;
    /** React component module exporting the default ToolViewProps component. */
    desktop: string;
  };
  /** CLI bin name, e.g. 'td-json-formatter'. */
  bin?: string;
}

/** Subset of a tool package.json relevant to the hub. */
export interface ToolPackageJson {
  name: string;
  version: string;
  tooldepot: ToolDepotMeta;
  bin?: Record<string, string>;
  main?: string;
  exports?: Record<string, string>;
}
