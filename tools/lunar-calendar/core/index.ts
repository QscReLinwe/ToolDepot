import type { Tool, ToolOutput } from '@tooldepot/types';

export interface LunarCalendarInput {
  date: string;
}

export interface LunarCalendarOutput {
  lunarDate: string;
  zodiac: string;
  ganzhiYear: string;
  ganzhiMonth: string;
  ganzhiDay: string;
  solarTerm: string;
  nextSolarTerm: string;
  lunarFestival: string;
  gregorianFestival: string;
}

const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const ZODIAC = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
const LUNAR_MONTH = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月'];
const LUNAR_DAY = [
  '初一',
  '初二',
  '初三',
  '初四',
  '初五',
  '初六',
  '初七',
  '初八',
  '初九',
  '初十',
  '十一',
  '十二',
  '十三',
  '十四',
  '十五',
  '十六',
  '十七',
  '十八',
  '十九',
  '二十',
  '廿一',
  '廿二',
  '廿三',
  '廿四',
  '廿五',
  '廿六',
  '廿七',
  '廿八',
  '廿九',
  '三十',
];

const SOLAR_TERMS = [
  { name: '小寒', date: [1, 5] },
  { name: '大寒', date: [1, 20] },
  { name: '立春', date: [2, 4] },
  { name: '雨水', date: [2, 19] },
  { name: '惊蛰', date: [3, 6] },
  { name: '春分', date: [3, 21] },
  { name: '清明', date: [4, 5] },
  { name: '谷雨', date: [4, 20] },
  { name: '立夏', date: [5, 6] },
  { name: '小满', date: [5, 21] },
  { name: '芒种', date: [6, 6] },
  { name: '夏至', date: [6, 21] },
  { name: '小暑', date: [7, 7] },
  { name: '大暑', date: [7, 23] },
  { name: '立秋', date: [8, 8] },
  { name: '处暑', date: [8, 23] },
  { name: '白露', date: [9, 8] },
  { name: '秋分', date: [9, 23] },
  { name: '寒露', date: [10, 8] },
  { name: '霜降', date: [10, 24] },
  { name: '立冬', date: [11, 8] },
  { name: '小雪', date: [11, 22] },
  { name: '大雪', date: [12, 7] },
  { name: '冬至', date: [12, 22] },
];

const LUNAR_FESTIVALS: Record<string, string> = {
  '1-1': '春节',
  '1-15': '元宵节',
  '5-5': '端午节',
  '7-7': '七夕节',
  '7-15': '中元节',
  '8-15': '中秋节',
  '9-9': '重阳节',
  '12-8': '腊八节',
  '12-23': '小年',
  '12-30': '除夕',
};

const GREGORIAN_FESTIVALS: Record<string, string> = {
  '1-1': '元旦',
  '3-8': '妇女节',
  '5-1': '劳动节',
  '6-1': '儿童节',
  '8-1': '建军节',
  '10-1': '国庆节',
  '12-25': '圣诞节',
};

function parseDate(str: string): Date | null {
  const m = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function getGanzhiYear(year: number): string {
  const offset = 4;
  return TIANGAN[(((year - offset) % 10) + 10) % 10]! + DIZHI[(((year - offset) % 12) + 12) % 12]!;
}

function getZodiac(year: number): string {
  return ZODIAC[(((year - 4) % 12) + 12) % 12]!;
}

function getSolarTerm(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  for (const term of SOLAR_TERMS) {
    if (term.date[0] === month && term.date[1] === day) {
      return term.name;
    }
  }
  return '';
}

function getNextSolarTerm(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  for (const term of SOLAR_TERMS) {
    if (term.date[0]! > month || (term.date[0]! === month && term.date[1]! > day)) {
      return term.name;
    }
  }
  return SOLAR_TERMS[0]?.name ?? '';
}

function lunarDate(date: Date): { year: number; month: number; day: number; leap: boolean } {
  const CNY_DATES: Record<number, { month: number; day: number }> = {
    1900: { month: 1, day: 31 },
    1901: { month: 2, day: 19 },
    1902: { month: 2, day: 8 },
    1903: { month: 1, day: 29 },
    1904: { month: 2, day: 16 },
    1905: { month: 2, day: 4 },
    1906: { month: 1, day: 25 },
    1907: { month: 2, day: 13 },
    1908: { month: 2, day: 2 },
    1909: { month: 1, day: 22 },
    1910: { month: 2, day: 10 },
    1911: { month: 1, day: 30 },
    1912: { month: 2, day: 18 },
    1913: { month: 2, day: 6 },
    1914: { month: 1, day: 26 },
    1915: { month: 2, day: 14 },
    1916: { month: 2, day: 3 },
    1917: { month: 1, day: 23 },
    1918: { month: 2, day: 11 },
    1919: { month: 2, day: 1 },
    1920: { month: 2, day: 20 },
    1921: { month: 2, day: 8 },
    1922: { month: 1, day: 28 },
    1923: { month: 2, day: 16 },
    1924: { month: 2, day: 5 },
    1925: { month: 1, day: 24 },
    1926: { month: 2, day: 13 },
    1927: { month: 2, day: 2 },
    1928: { month: 1, day: 23 },
    1929: { month: 2, day: 10 },
    1930: { month: 1, day: 30 },
    1931: { month: 2, day: 17 },
    1932: { month: 2, day: 6 },
    1933: { month: 1, day: 26 },
    1934: { month: 2, day: 14 },
    1935: { month: 2, day: 4 },
    1936: { month: 1, day: 24 },
    1937: { month: 2, day: 11 },
    1938: { month: 1, day: 31 },
    1939: { month: 2, day: 19 },
    1940: { month: 2, day: 8 },
    1941: { month: 1, day: 27 },
    1942: { month: 2, day: 15 },
    1943: { month: 2, day: 5 },
    1944: { month: 1, day: 25 },
    1945: { month: 2, day: 13 },
    1946: { month: 2, day: 2 },
    1947: { month: 1, day: 22 },
    1948: { month: 2, day: 10 },
    1949: { month: 1, day: 29 },
    1950: { month: 2, day: 17 },
    1951: { month: 2, day: 6 },
    1952: { month: 1, day: 27 },
    1953: { month: 2, day: 14 },
    1954: { month: 2, day: 3 },
    1955: { month: 1, day: 24 },
    1956: { month: 2, day: 12 },
    1957: { month: 1, day: 31 },
    1958: { month: 2, day: 18 },
    1959: { month: 2, day: 8 },
    1960: { month: 1, day: 28 },
    1961: { month: 2, day: 15 },
    1962: { month: 2, day: 5 },
    1963: { month: 1, day: 25 },
    1964: { month: 2, day: 13 },
    1965: { month: 2, day: 2 },
    1966: { month: 1, day: 21 },
    1967: { month: 2, day: 9 },
    1968: { month: 1, day: 30 },
    1969: { month: 2, day: 17 },
    1970: { month: 2, day: 6 },
    1971: { month: 1, day: 27 },
    1972: { month: 2, day: 15 },
    1973: { month: 2, day: 3 },
    1974: { month: 1, day: 23 },
    1975: { month: 2, day: 11 },
    1976: { month: 1, day: 31 },
    1977: { month: 2, day: 18 },
    1978: { month: 2, day: 7 },
    1979: { month: 1, day: 28 },
    1980: { month: 2, day: 16 },
    1981: { month: 2, day: 5 },
    1982: { month: 1, day: 25 },
    1983: { month: 2, day: 13 },
    1984: { month: 2, day: 2 },
    1985: { month: 2, day: 20 },
    1986: { month: 2, day: 9 },
    1987: { month: 1, day: 29 },
    1988: { month: 2, day: 17 },
    1989: { month: 2, day: 6 },
    1990: { month: 1, day: 27 },
    1991: { month: 2, day: 15 },
    1992: { month: 2, day: 4 },
    1993: { month: 1, day: 23 },
    1994: { month: 2, day: 10 },
    1995: { month: 1, day: 31 },
    1996: { month: 2, day: 19 },
    1997: { month: 2, day: 7 },
    1998: { month: 1, day: 28 },
    1999: { month: 2, day: 16 },
    2000: { month: 2, day: 5 },
    2001: { month: 1, day: 24 },
    2002: { month: 2, day: 12 },
    2003: { month: 2, day: 1 },
    2004: { month: 1, day: 22 },
    2005: { month: 2, day: 9 },
    2006: { month: 1, day: 29 },
    2007: { month: 2, day: 18 },
    2008: { month: 2, day: 7 },
    2009: { month: 1, day: 26 },
    2010: { month: 2, day: 14 },
    2011: { month: 2, day: 3 },
    2012: { month: 1, day: 23 },
    2013: { month: 2, day: 10 },
    2014: { month: 1, day: 31 },
    2015: { month: 2, day: 19 },
    2016: { month: 2, day: 8 },
    2017: { month: 1, day: 28 },
    2018: { month: 2, day: 16 },
    2019: { month: 2, day: 5 },
    2020: { month: 1, day: 25 },
    2021: { month: 2, day: 12 },
    2022: { month: 2, day: 1 },
    2023: { month: 1, day: 22 },
    2024: { month: 2, day: 10 },
    2025: { month: 1, day: 29 },
    2026: { month: 2, day: 17 },
    2027: { month: 2, day: 6 },
    2028: { month: 1, day: 26 },
    2029: { month: 2, day: 13 },
    2030: { month: 2, day: 3 },
    2031: { month: 1, day: 23 },
    2032: { month: 2, day: 11 },
    2033: { month: 1, day: 31 },
    2034: { month: 2, day: 19 },
    2035: { month: 2, day: 8 },
    2036: { month: 1, day: 28 },
    2037: { month: 2, day: 15 },
    2038: { month: 2, day: 4 },
    2039: { month: 1, day: 24 },
    2040: { month: 2, day: 12 },
    2041: { month: 2, day: 1 },
    2042: { month: 1, day: 22 },
    2043: { month: 2, day: 10 },
    2044: { month: 1, day: 30 },
    2045: { month: 2, day: 17 },
    2046: { month: 2, day: 6 },
    2047: { month: 1, day: 26 },
    2048: { month: 2, day: 14 },
    2049: { month: 2, day: 2 },
    2050: { month: 2, day: 20 },
  };

  const year = date.getFullYear();
  const cny = CNY_DATES[year];
  if (!cny) {
    return { year: 1900, month: 1, day: 1, leap: false };
  }

  const cnyDate = new Date(year, cny.month - 1, cny.day);
  const diffDays = Math.floor((date.getTime() - cnyDate.getTime()) / 86400000);

  if (diffDays < 0) {
    const prevYear = year - 1;
    const prevCny = CNY_DATES[prevYear];
    if (!prevCny) {
      return { year: 1900, month: 1, day: 1, leap: false };
    }
    const prevCnyDate = new Date(prevYear, prevCny.month - 1, prevCny.day);
    const prevDiffDays = Math.floor((date.getTime() - prevCnyDate.getTime()) / 86400000);
    return lunarDateFromCny(prevYear, prevCnyDate, prevDiffDays);
  }

  return lunarDateFromCny(year, cnyDate, diffDays);
}

function lunarDateFromCny(
  year: number,
  _cnyDate: Date,
  diffDays: number,
): { year: number; month: number; day: number; leap: boolean } {
  const LUNAR_MONTH_DAYS = [29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30];

  let month = 1;
  let day = diffDays + 1;
  const leap = false;

  for (let i = 0; i < LUNAR_MONTH_DAYS.length; i++) {
    if (day <= LUNAR_MONTH_DAYS[i]!) {
      month = i + 1;
      break;
    }
    day -= LUNAR_MONTH_DAYS[i]!;
  }

  return { year, month, day, leap };
}

function getGanzhiMonth(year: number, month: number): string {
  const baseYear = 1984;
  const offset = (year - baseYear) * 12 + month - 1;
  return TIANGAN[(((offset + 10) % 10) + 10) % 10]! + DIZHI[(((offset + 1) % 12) + 12) % 12]!;
}

function getGanzhiDay(date: Date): string {
  const baseDate = new Date(1984, 1, 4);
  const diffDays = Math.floor((date.getTime() - baseDate.getTime()) / 86400000);
  return TIANGAN[(((diffDays + 10) % 10) + 10) % 10]! + DIZHI[(((diffDays + 1) % 12) + 12) % 12]!;
}

export const tool: Tool<LunarCalendarInput, LunarCalendarOutput> = {
  id: 'lunar-calendar',
  name: '农历查询',
  description: '公历转农历、生肖、二十四节气、节日查询',
  category: 'utility',
  async run(input: LunarCalendarInput): Promise<ToolOutput<LunarCalendarOutput>> {
    if (!input?.date) {
      return { ok: false, error: 'date (YYYY-MM-DD) 是必填项' };
    }
    const date = parseDate(input.date);
    if (!date) {
      return { ok: false, error: '日期格式必须为 YYYY-MM-DD' };
    }

    const lunar = lunarDate(date);
    const _year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const lunarMonthName = LUNAR_MONTH[lunar.month - 1] ?? '';
    const lunarDayName = LUNAR_DAY[lunar.day - 1] ?? '';
    const lunarDateStr = `${lunar.year}年${lunarMonthName}${lunarDayName}`;
    const zodiac = getZodiac(lunar.year);
    const ganzhiYear = getGanzhiYear(lunar.year);
    const ganzhiMonth = getGanzhiMonth(lunar.year, lunar.month);
    const ganzhiDay = getGanzhiDay(date);
    const solarTerm = getSolarTerm(date);
    const nextSolarTerm = getNextSolarTerm(date);
    const lunarFestival = LUNAR_FESTIVALS[`${lunar.month}-${lunar.day}`] ?? '';
    const gregorianFestival = GREGORIAN_FESTIVALS[`${month}-${day}`] ?? '';

    return {
      ok: true,
      data: {
        lunarDate: lunarDateStr,
        zodiac,
        ganzhiYear,
        ganzhiMonth,
        ganzhiDay,
        solarTerm,
        nextSolarTerm,
        lunarFestival,
        gregorianFestival,
      },
      mimeType: 'application/json',
    };
  },
};

export default tool;
