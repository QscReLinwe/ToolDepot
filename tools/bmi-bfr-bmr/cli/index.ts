#!/usr/bin/env node
import { pathToFileURL } from 'node:url';
import type { Sex } from '../core/index.js';
import { tool } from '../core/index.js';

function printUsage() {
  console.log(`Usage: td-bmi-bfr-bmr --weight <kg> --height <cm> --age <years> --sex <male|female> [--waist <cm>] [--neck <cm>] [--hip <cm>]

Arguments:
  --weight, -w   Weight in kilograms (required)
  --height, -h   Height in centimeters (required)
  --age, -a      Age in years (required)
  --sex, -s      Biological sex: male or female (required)
  --waist        Waist circumference in cm (enables US Navy body fat)
  --neck         Neck circumference in cm (enables US Navy body fat)
  --hip          Hip circumference in cm (required for female US Navy)

Examples:
  td-bmi-bfr-bmr --weight 80 --height 180 --age 30 --sex male
  td-bmi-bfr-bmr -w 70 -h 165 -a 28 -s female --waist 70 --neck 32 --hip 95
`);
}

function parseArgs(argv: string[]): Record<string, string> {
  const args: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg) continue;
    const key = arg.startsWith('--') ? arg.slice(2) : arg.startsWith('-') && arg.length === 2 ? arg[1] : null;
    if (!key) continue;
    const next = argv[i + 1];
    if (next !== undefined && !next.startsWith('-')) {
      args[key] = next;
      i++;
    } else {
      args[key] = 'true';
    }
  }
  return args;
}

function num(v: string | undefined): number | undefined {
  if (v === undefined) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export async function run(argv: string[]): Promise<void> {
  if (argv.includes('--help') || argv.includes('-h') || argv.length === 0) {
    printUsage();
    return;
  }

  const a = parseArgs(argv);
  const weightKg = num(a.weight ?? a.w);
  const heightCm = num(a.height ?? a.h);
  const age = num(a.age ?? a.a);
  const sexRaw = a.sex ?? a.s;
  const waistCm = num(a.waist);
  const neckCm = num(a.neck);
  const hipCm = num(a.hip);

  if (weightKg === undefined || heightCm === undefined || age === undefined || !sexRaw) {
    printUsage();
    process.exitCode = 1;
    return;
  }
  if (sexRaw !== 'male' && sexRaw !== 'female') {
    console.error("sex must be 'male' or 'female'");
    process.exitCode = 1;
    return;
  }
  const sex = sexRaw as Sex;

  const result = await tool.run({
    weightKg,
    heightCm,
    age,
    sex,
    waistCm,
    neckCm,
    hipCm,
  });

  if (result.ok) {
    console.log(JSON.stringify(result.data, null, 2));
  } else {
    console.error(result.error ?? 'unknown error');
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
