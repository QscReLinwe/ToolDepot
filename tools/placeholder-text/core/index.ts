import type { Tool, ToolOutput } from '@tooldepot/types';

export type PlaceholderUnit = 'words' | 'sentences' | 'paragraphs';
export type PlaceholderLanguage = 'en' | 'zh';

export interface PlaceholderTextInput {
  count: number;
  unit: PlaceholderUnit;
  startWithLorem?: boolean;
  language?: PlaceholderLanguage;
}

export interface PlaceholderTextOutput {
  text: string;
  words: number;
}

const EN_WORDS: string[] = [
  'lorem',
  'ipsum',
  'dolor',
  'sit',
  'amet',
  'consectetur',
  'adipiscing',
  'elit',
  'sed',
  'do',
  'eiusmod',
  'tempor',
  'incididunt',
  'ut',
  'labore',
  'et',
  'dolore',
  'magna',
  'aliqua',
  'enim',
  'ad',
  'minim',
  'veniam',
  'quis',
  'nostrud',
  'exercitation',
  'ullamco',
  'laboris',
  'nisi',
  'aliquip',
  'ex',
  'ea',
  'commodo',
  'consequat',
  'duis',
  'aute',
  'irure',
  'in',
  'reprehenderit',
  'voluptate',
  'velit',
  'esse',
  'cillum',
  'fugiat',
  'nulla',
  'pariatur',
  'excepteur',
  'sint',
  'occaecat',
  'cupidatat',
  'non',
  'proident',
  'sunt',
  'culpa',
  'qui',
  'officia',
  'deserunt',
  'mollit',
  'anim',
  'id',
  'est',
  'laborum',
  'perspiciatis',
  'unde',
  'omnis',
  'iste',
  'natus',
  'error',
  'voluptatem',
  'accusantium',
  'doloremque',
  'laudantium',
  'totam',
  'rem',
  'aperiam',
  'eaque',
  'ipsa',
  'quae',
  'ab',
  'illo',
  'inventore',
  'veritatis',
  'quasi',
  'architecto',
  'beatae',
  'vitae',
  'dicta',
  'explicabo',
  'nemo',
  'ipsam',
  'quia',
  'voluptas',
  'aspernatur',
  'aut',
  'odit',
  'fugit',
  'harum',
  'quidem',
  'rerum',
  'necessitatibus',
];

const ZH_WORDS: string[] = [
  '我们',
  '今天',
  '学习',
  '知识',
  '世界',
  '美丽',
  '自然',
  '科学',
  '技术',
  '发展',
  '生活',
  '快乐',
  '朋友',
  '梦想',
  '努力',
  '成功',
  '智慧',
  '思考',
  '创造',
  '未来',
  '山川',
  '河流',
  '阳光',
  '雨露',
  '春风',
  '秋月',
  '星辰',
  '大海',
  '森林',
  '花朵',
  '认真',
  '观察',
  '理解',
  '探索',
  '发现',
  '实践',
  '坚持',
  '勇敢',
  '温柔',
  '真诚',
  '因为',
  '所以',
  '如果',
  '那么',
  '虽然',
  '但是',
  '而且',
  '于是',
  '然而',
  '并且',
  '重要',
  '简单',
  '复杂',
  '清晰',
  '深刻',
  '广泛',
  '丰富',
  '安静',
  '活跃',
  '自由',
];

const LOREM_OPENING = ['Lorem', 'ipsum', 'dolor', 'sit', 'amet'];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)] as T;
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function makeEnSentence(startWithLorem: boolean, usedOpening: { value: boolean }): string {
  const len = 5 + Math.floor(Math.random() * 8); // 5..12 words
  const words: string[] = [];
  if (startWithLorem && !usedOpening.value && Math.random() < 0.5) {
    words.push(...LOREM_OPENING);
    usedOpening.value = true;
  }
  while (words.length < len) {
    words.push(pick(EN_WORDS));
  }
  let sentence = words.join(' ');
  sentence = capitalize(sentence);
  return `${sentence}.`;
}

function makeZhSentence(): string {
  const len = 4 + Math.floor(Math.random() * 7); // 4..10 words
  const words: string[] = [];
  while (words.length < len) {
    words.push(pick(ZH_WORDS));
  }
  return `${words.join('')}。`;
}

export const tool: Tool<PlaceholderTextInput, PlaceholderTextOutput> = {
  id: 'placeholder-text',
  name: '占位文本生成',
  description: '生成 Lorem Ipsum / 随机占位文本。',
  category: 'generate',
  async run(input: PlaceholderTextInput): Promise<ToolOutput<PlaceholderTextOutput>> {
    const count = input?.count;
    const unit: PlaceholderUnit = input?.unit ?? 'paragraphs';
    const startWithLorem = input?.startWithLorem ?? true;
    const language: PlaceholderLanguage = input?.language ?? 'en';

    if (typeof count !== 'number' || !Number.isFinite(count) || count < 1) {
      return { ok: false, error: 'count must be a positive number' };
    }
    if (unit !== 'words' && unit !== 'sentences' && unit !== 'paragraphs') {
      return { ok: false, error: "Invalid unit (expected 'words'|'sentences'|'paragraphs')" };
    }
    if (language !== 'en' && language !== 'zh') {
      return { ok: false, error: "Invalid language (expected 'en'|'zh')" };
    }

    const usedOpening = { value: false };
    const isZh = language === 'zh';
    let wordCount = 0;

    if (unit === 'words') {
      const words: string[] = [];
      if (isZh) {
        for (let i = 0; i < count; i++) words.push(pick(ZH_WORDS));
        wordCount = words.length;
        return { ok: true, data: { text: words.join(''), words: wordCount }, mimeType: 'text/plain' };
      }
      if (startWithLorem && count >= LOREM_OPENING.length) {
        words.push(...LOREM_OPENING);
      }
      while (words.length < count) words.push(pick(EN_WORDS));
      wordCount = words.length;
      return { ok: true, data: { text: words.join(' '), words: wordCount }, mimeType: 'text/plain' };
    }

    if (unit === 'sentences') {
      const sentences: string[] = [];
      for (let i = 0; i < count; i++) {
        const s = isZh ? makeZhSentence() : makeEnSentence(startWithLorem, usedOpening);
        sentences.push(s);
        wordCount += isZh ? Math.ceil(s.length / 2) : s.split(/\s+/).length;
      }
      return { ok: true, data: { text: sentences.join(' '), words: wordCount }, mimeType: 'text/plain' };
    }

    // paragraphs
    const paragraphs: string[] = [];
    for (let p = 0; p < count; p++) {
      const sentenceCount = 3 + Math.floor(Math.random() * 3); // 3..5
      const sentences: string[] = [];
      for (let i = 0; i < sentenceCount; i++) {
        const s = isZh ? makeZhSentence() : makeEnSentence(startWithLorem, usedOpening);
        sentences.push(s);
        wordCount += isZh ? Math.ceil(s.length / 2) : s.split(/\s+/).length;
      }
      paragraphs.push(sentences.join(' '));
    }
    return { ok: true, data: { text: paragraphs.join('\n\n'), words: wordCount }, mimeType: 'text/plain' };
  },
};

export default tool;
