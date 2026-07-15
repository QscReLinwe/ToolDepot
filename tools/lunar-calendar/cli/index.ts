import { pathToFileURL } from 'node:url';
import { tool } from '../core/index.js';

function printUsage(): void {
  console.log(`Usage: td-lunar-calendar <date> [options]

 Convert Gregorian to lunar date, zodiac, solar terms, and festivals

Arguments:
   <date>         Gregorian date, format YYYY-MM-DD

Options:
   --help, -h     Show help

Examples:
   td-lunar-calendar 2025-01-29
   td-lunar-calendar 2024-10-01
 `);
}

export async function run(argv: string[]): Promise<void> {
  if (argv.includes('--help') || argv.includes('-h')) {
    printUsage();
    return;
  }

  const args = argv.filter((a) => !a.startsWith('-'));
  const date = args[0];

  if (!date) {
    console.error('Error: Missing date argument (YYYY-MM-DD)');
    printUsage();
    process.exitCode = 1;
    return;
  }

  const result = await tool.run({ date });

  if (result.ok && result.data) {
    console.log(`${result.data.lunarDate}  ${result.data.zodiac} year`);
    console.log(`Stem-Branch year: ${result.data.ganzhiYear}`);
    console.log(`Stem-Branch month: ${result.data.ganzhiMonth}`);
    console.log(`Stem-Branch day: ${result.data.ganzhiDay}`);
    if (result.data.solarTerm) console.log(`Solar term: ${result.data.solarTerm}`);
    if (result.data.nextSolarTerm) console.log(`Next solar term: ${result.data.nextSolarTerm}`);
    if (result.data.lunarFestival) console.log(`Lunar festival: ${result.data.lunarFestival}`);
    if (result.data.gregorianFestival) console.log(`Gregorian festival: ${result.data.gregorianFestival}`);
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
