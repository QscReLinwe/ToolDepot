import { pathToFileURL } from 'node:url';
import type { Tool } from '@tooldepot/types';
import { Command } from 'commander';

export interface CliOption {
  flags: string;
  description: string;
  defaultValue?: string | boolean | string[];
  required?: boolean;
}

export interface CliOptions<I, O = unknown> {
  tool: Tool<I, O>;
  options?: CliOption[];
  positionalArg?: string;
  positionalDescription?: string;
}

export async function runCli<I, O = unknown>(argv: string[], options: CliOptions<I, O>): Promise<void> {
  const { tool, options: cliOptions = [], positionalArg, positionalDescription } = options;
  const program = new Command();
  let positionalValue: string | undefined;

  for (const opt of cliOptions) {
    program.option(opt.flags, opt.description, opt.defaultValue);
  }

  if (positionalArg) {
    program.argument(`[${positionalArg}]`, positionalDescription || positionalArg).action((value?: string) => {
      positionalValue = value;
    });
  }

  program.parse(argv, { from: 'user' });

  const opts = program.opts() as Record<string, unknown>;
  const input: Record<string, unknown> = {};

  for (const opt of cliOptions) {
    const key = opt.flags.split(',')[0]?.replace(/^--?/, '').replace(/<.*$/, '').trim();
    if (key && typeof opts[key] !== 'undefined') {
      input[key] = opts[key];
    }
  }

  if (positionalArg && positionalValue !== undefined) {
    input[positionalArg] = positionalValue;
  }

  const hasInput = Object.keys(input).length > 0;
  if (!hasInput && process.stdin.isTTY === undefined) {
    const stdin = await readStdin();
    if (stdin) input.text = stdin;
  }

  if (!hasInput && Object.keys(input).length === 0) {
    program.help();
    process.exitCode = 1;
    return;
  }

  try {
    const result = await tool.run(input as I);
    if (result.ok && result.data) {
      const data = result.data as unknown as { result?: string } & Record<string, unknown>;
      if (data.result !== undefined) {
        process.stdout.write(`${data.result}\n`);
      } else {
        process.stdout.write(`${JSON.stringify(data)}\n`);
      }
    } else {
      process.stderr.write(`${result.error}\n`);
      process.exitCode = 1;
    }
  } catch (e) {
    process.stderr.write(`${String(e)}\n`);
    process.exitCode = 1;
  }
}

async function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      data += chunk;
    });
    process.stdin.on('end', () => resolve(data));
    process.stdin.on('error', reject);
  });
}

export function createCliEntry<I, O = unknown>(tool: Tool<I, O>, options: Omit<CliOptions<I, O>, 'tool'>) {
  return async (argv: string[] = process.argv.slice(2)) => {
    await runCli(argv, { tool, ...options });
  };
}

export function autoRun<I, O = unknown>(tool: Tool<I, O>, options: Omit<CliOptions<I, O>, 'tool'>) {
  if (import.meta.url === pathToFileURL(process.argv[1]!).href) {
    runCli(process.argv.slice(2), { tool, ...options }).catch((e) => {
      console.error(String(e));
      process.exitCode = 1;
    });
  }
}
