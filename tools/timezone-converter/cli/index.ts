import { pathToFileURL } from 'node:url';
import { tool } from '../core/index.js';

function printUsage() {
  console.log(`Usage: td-timezone-converter <timestamp> --from <timezone> --to <timezone> [--format <format>]

Arguments:
   timestamp    Timestamp to convert (ISO 8601, Unix ms, or Unix s)
   --from, -f   Source timezone (IANA name, e.g. America/New_York, UTC)
   --to, -t     Target timezone (IANA name)
   --format     Output format (date-fns format, default: "yyyy-MM-dd'T'HH:mm:ssXXX")

Examples:
   td-timezone-converter 1704067200000 --from UTC --to America/New_York
   td-timezone-converter "2024-01-01T00:00:00Z" --from UTC --to America/New_York
   td-timezone-converter 1704067200 --from UTC --to Asia/Shanghai --format "yyyy-MM-dd HH:mm:ss"
 `);
}

export async function run(argv: string[]): Promise<void> {
  let timestamp: string | undefined;
  let from: string | undefined;
  let f: string | undefined;
  let to: string | undefined;
  let t: string | undefined;
  let format: string | undefined;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg) continue;
    if (arg === '--help' || arg === '-h') {
      printUsage();
      process.exit(0);
    }
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (key === 'from' && next && !next.startsWith('-')) {
        from = next;
        i++;
      } else if (key === 'f' && next && !next.startsWith('-')) {
        f = next;
        i++;
      } else if (key === 'to' && next && !next.startsWith('-')) {
        to = next;
        i++;
      } else if (key === 't' && next && !next.startsWith('-')) {
        t = next;
        i++;
      }
      if (key === 'format' && argv[i + 1] && !argv[i + 1]!.startsWith('-')) {
        format = argv[i + 1]!;
        i++;
      } else if (key === 'help' || key === 'h') {
        printUsage();
        process.exit(0);
      }
    } else if (arg.startsWith('-') && arg.length === 2) {
      const key = arg[1];
      if (key === 'f' && argv[i + 1] && !argv[i + 1]!.startsWith('-')) {
        f = argv[i + 1]!;
        i++;
      } else if (key === 't' && argv[i + 1] && !argv[i + 1]!.startsWith('-')) {
        t = argv[i + 1]!;
        i++;
      } else if (key === 'h') {
        printUsage();
        process.exit(0);
      }
    } else if (!timestamp) {
      timestamp = argv[i];
    }
  }

  if (!timestamp) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  const timestampParsed = Number.isNaN(Number(timestamp)) ? timestamp : Number(timestamp);
  const fromTz = from ?? f;
  const toTz = to ?? t;

  if (!fromTz || !toTz) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  const result = await tool.run({
    timestamp: timestampParsed,
    fromTz,
    toTz,
    format,
  });

  if (result.ok && result.data) {
    console.log(result.data.result);
  } else {
    console.error(`Error: ${result.error}`);
    process.exitCode = 1;
  }
}

const invokedDirectly = import.meta.url === pathToFileURL(process.argv[1] ?? '').href;
if (invokedDirectly) {
  run(process.argv.slice(2)).catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}
