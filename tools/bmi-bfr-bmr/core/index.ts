import type { Tool, ToolInput } from '@tooldepot/types';

export type Sex = 'male' | 'female';

export interface BmiBfrBmrInput extends ToolInput {
  weightKg: number;
  heightCm: number;
  age: number;
  sex: Sex;
  waistCm?: number;
  neckCm?: number;
  hipCm?: number;
}

export interface BmiBfrBmrOutput {
  bmi: number;
  bmiCategory: string;
  bmr: number;
  bodyFat?: number;
  bodyFatNavy?: number;
}

function classifyBmi(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

function round(n: number, dp = 2): number {
  const f = 10 ** dp;
  return Math.round(n * f) / f;
}

export const tool: Tool<BmiBfrBmrInput, BmiBfrBmrOutput> = {
  id: 'bmi-bfr-bmr',
  name: 'BMI / 基础代谢 / 体脂率',
  description: '计算 BMI、基础代谢率（Mifflin-St Jeor）与体脂率。',
  category: 'health',
  async run(input) {
    const weightKg = input?.weightKg;
    const heightCm = input?.heightCm;
    const age = input?.age;
    const sex = input?.sex;

    if (typeof weightKg !== 'number' || !Number.isFinite(weightKg) || weightKg <= 0) {
      return { ok: false, error: 'weightKg must be a positive number' };
    }
    if (typeof heightCm !== 'number' || !Number.isFinite(heightCm) || heightCm <= 0) {
      return { ok: false, error: 'heightCm must be a positive number' };
    }
    if (typeof age !== 'number' || !Number.isFinite(age) || age <= 0 || age > 120) {
      return { ok: false, error: 'age must be a positive number (<= 120)' };
    }
    if (sex !== 'male' && sex !== 'female') {
      return { ok: false, error: "sex must be 'male' or 'female'" };
    }

    const heightM = heightCm / 100;
    const bmi = round(weightKg / (heightM * heightM));
    const bmiCategory = classifyBmi(bmi);

    // Mifflin-St Jeor
    const bmr = round(10 * weightKg + 6.25 * heightCm - 5 * age + (sex === 'male' ? 5 : -161));

    // Deurenberg formula: BF% = 1.20*BMI + 0.23*age - 10.8*sex - 5.4
    const sexFactor = sex === 'male' ? 1 : 0;
    const bodyFat = round(1.2 * bmi + 0.23 * age - 10.8 * sexFactor - 5.4);

    const data: BmiBfrBmrOutput = { bmi, bmiCategory, bmr, bodyFat };

    // US Navy method (requires waist + neck; hip required for females)
    const waistCm = input?.waistCm;
    const neckCm = input?.neckCm;
    const hipCm = input?.hipCm;
    const hasNavy =
      typeof waistCm === 'number' &&
      typeof neckCm === 'number' &&
      waistCm > 0 &&
      neckCm > 0 &&
      (sex === 'male' || (typeof hipCm === 'number' && hipCm > 0));

    if (hasNavy) {
      const log = Math.log10;
      let navy: number;
      if (sex === 'male') {
        if (waistCm - neckCm <= 0) {
          return { ok: false, error: '腰围必须大于颈围才能用 US Navy 公式估算体脂' };
        }
        navy = 495 / (1.0324 - 0.19077 * log(waistCm - neckCm) + 0.15456 * log(heightCm)) - 450;
      } else {
        if (typeof hipCm !== 'number') {
          return { ok: false, error: 'hipCm is required for the female US Navy body-fat method' };
        }
        if (waistCm + hipCm - neckCm <= 0) {
          return { ok: false, error: '腰围加臀围必须大于颈围才能用 US Navy 公式估算体脂' };
        }
        navy = 495 / (1.29579 - 0.35004 * log(waistCm + hipCm - neckCm) + 0.221 * log(heightCm)) - 450;
      }
      if (Number.isFinite(navy)) {
        data.bodyFatNavy = round(navy);
      }
    }

    return { ok: true, data, mimeType: 'application/json' };
  },
};

export default tool;
