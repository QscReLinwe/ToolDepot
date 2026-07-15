import type { Tool, ToolViewProps } from '@tooldepot/types';
import { type ComponentType, lazy } from 'react';
import { tool as alarmTool } from '../../../tools/alarm/core';

const alarmComponent = lazy(() => import('../../../tools/alarm/desktop').then((m) => ({ default: m.Component })));

import { tool as baseconvertTool } from '../../../tools/base-convert/core';

const baseconvertComponent = lazy(() =>
  import('../../../tools/base-convert/desktop').then((m) => ({ default: m.Component })),
);

import { tool as base64Tool } from '../../../tools/base64/core';

const base64Component = lazy(() => import('../../../tools/base64/desktop').then((m) => ({ default: m.Component })));

import { tool as base64imageTool } from '../../../tools/base64-image/core';

const base64imageComponent = lazy(() =>
  import('../../../tools/base64-image/desktop').then((m) => ({ default: m.Component })),
);

import { tool as bmibfrbmrTool } from '../../../tools/bmi-bfr-bmr/core';

const bmibfrbmrComponent = lazy(() =>
  import('../../../tools/bmi-bfr-bmr/desktop').then((m) => ({ default: m.Component })),
);

import { tool as calcTool } from '../../../tools/calc/core';

const calcComponent = lazy(() => import('../../../tools/calc/desktop').then((m) => ({ default: m.Component })));

import { tool as caseconvertTool } from '../../../tools/case-convert/core';

const caseconvertComponent = lazy(() =>
  import('../../../tools/case-convert/desktop').then((m) => ({ default: m.Component })),
);

import { tool as colorconverterTool } from '../../../tools/color-converter/core';

const colorconverterComponent = lazy(() =>
  import('../../../tools/color-converter/desktop').then((m) => ({ default: m.Component })),
);

import { tool as colorpaletteTool } from '../../../tools/color-palette/core';

const colorpaletteComponent = lazy(() =>
  import('../../../tools/color-palette/desktop').then((m) => ({ default: m.Component })),
);

import { tool as compoundinterestTool } from '../../../tools/compound-interest/core';

const compoundinterestComponent = lazy(() =>
  import('../../../tools/compound-interest/desktop').then((m) => ({ default: m.Component })),
);

import { tool as countdownTool } from '../../../tools/countdown/core';

const countdownComponent = lazy(() =>
  import('../../../tools/countdown/desktop').then((m) => ({ default: m.Component })),
);

import { tool as cronparserTool } from '../../../tools/cron-parser/core';

const cronparserComponent = lazy(() =>
  import('../../../tools/cron-parser/desktop').then((m) => ({ default: m.Component })),
);

import { tool as cssjsminifyTool } from '../../../tools/css-js-minify/core';

const cssjsminifyComponent = lazy(() =>
  import('../../../tools/css-js-minify/desktop').then((m) => ({ default: m.Component })),
);

import { tool as csvtsvTool } from '../../../tools/csv-tsv/core';

const csvtsvComponent = lazy(() => import('../../../tools/csv-tsv/desktop').then((m) => ({ default: m.Component })));

import { tool as currencyexchangeTool } from '../../../tools/currency-exchange/core';

const currencyexchangeComponent = lazy(() =>
  import('../../../tools/currency-exchange/desktop').then((m) => ({ default: m.Component })),
);

import { tool as curtaincalcTool } from '../../../tools/curtain-calc/core';

const curtaincalcComponent = lazy(() =>
  import('../../../tools/curtain-calc/desktop').then((m) => ({ default: m.Component })),
);

import { tool as datecalcTool } from '../../../tools/date-calc/core';

const datecalcComponent = lazy(() =>
  import('../../../tools/date-calc/desktop').then((m) => ({ default: m.Component })),
);

import { tool as dedupsortTool } from '../../../tools/dedup-sort/core';

const dedupsortComponent = lazy(() =>
  import('../../../tools/dedup-sort/desktop').then((m) => ({ default: m.Component })),
);

import { tool as difftoolTool } from '../../../tools/diff-tool/core';

const difftoolComponent = lazy(() =>
  import('../../../tools/diff-tool/desktop').then((m) => ({ default: m.Component })),
);

import { tool as electricitycostTool } from '../../../tools/electricity-cost/core';

const electricitycostComponent = lazy(() =>
  import('../../../tools/electricity-cost/desktop').then((m) => ({ default: m.Component })),
);

import { tool as equationsolverTool } from '../../../tools/equation/core';

const equationsolverComponent = lazy(() =>
  import('../../../tools/equation/desktop').then((m) => ({ default: m.Component })),
);

import { tool as fontpreviewTool } from '../../../tools/font-preview/core';

const fontpreviewComponent = lazy(() =>
  import('../../../tools/font-preview/desktop').then((m) => ({ default: m.Component })),
);

import { tool as gradientgenTool } from '../../../tools/gradient-gen/core';

const gradientgenComponent = lazy(() =>
  import('../../../tools/gradient-gen/desktop').then((m) => ({ default: m.Component })),
);

import { tool as functiongraphTool } from '../../../tools/graph/core';

const functiongraphComponent = lazy(() =>
  import('../../../tools/graph/desktop').then((m) => ({ default: m.Component })),
);

import { tool as graphqlbuilderTool } from '../../../tools/graphql-builder/core';

const graphqlbuilderComponent = lazy(() =>
  import('../../../tools/graphql-builder/desktop').then((m) => ({ default: m.Component })),
);

import { tool as htmlentityTool } from '../../../tools/html-entity/core';

const htmlentityComponent = lazy(() =>
  import('../../../tools/html-entity/desktop').then((m) => ({ default: m.Component })),
);

import { tool as httpcodesTool } from '../../../tools/http-codes/core';

const httpcodesComponent = lazy(() =>
  import('../../../tools/http-codes/desktop').then((m) => ({ default: m.Component })),
);

import { tool as invoicetaxTool } from '../../../tools/invoice-tax/core';

const invoicetaxComponent = lazy(() =>
  import('../../../tools/invoice-tax/desktop').then((m) => ({ default: m.Component })),
);

import { tool as jsonformatterTool } from '../../../tools/json-formatter/core';

const jsonformatterComponent = lazy(() =>
  import('../../../tools/json-formatter/desktop').then((m) => ({ default: m.Component })),
);

import { tool as jwtdecoderTool } from '../../../tools/jwt-decoder/core';

const jwtdecoderComponent = lazy(() =>
  import('../../../tools/jwt-decoder/desktop').then((m) => ({ default: m.Component })),
);

import { tool as lunarCalendarTool } from '../../../tools/lunar-calendar/core';

const lunarCalendarComponent = lazy(() =>
  import('../../../tools/lunar-calendar/desktop').then((m) => ({ default: m.Component })),
);

import { tool as markdownpreviewTool } from '../../../tools/markdown-preview/core';

const markdownpreviewComponent = lazy(() =>
  import('../../../tools/markdown-preview/desktop').then((m) => ({ default: m.Component })),
);

import { tool as mortgageTool } from '../../../tools/mortgage/core';

const mortgageComponent = lazy(() => import('../../../tools/mortgage/desktop').then((m) => ({ default: m.Component })));

import { tool as paintfloorTool } from '../../../tools/paint-floor/core';

const paintfloorComponent = lazy(() =>
  import('../../../tools/paint-floor/desktop').then((m) => ({ default: m.Component })),
);

import { tool as passwordgeneratorTool } from '../../../tools/password-generator/core';

const passwordgeneratorComponent = lazy(() =>
  import('../../../tools/password-generator/desktop').then((m) => ({ default: m.Component })),
);

import { tool as passwordstrengthTool } from '../../../tools/password-strength/core';

const passwordstrengthComponent = lazy(() =>
  import('../../../tools/password-strength/desktop').then((m) => ({ default: m.Component })),
);

import { tool as personalbudgetTool } from '../../../tools/personal-budget/core';

const personalbudgetComponent = lazy(() =>
  import('../../../tools/personal-budget/desktop').then((m) => ({ default: m.Component })),
);

import { tool as placeholdertextTool } from '../../../tools/placeholder-text/core';

const placeholdertextComponent = lazy(() =>
  import('../../../tools/placeholder-text/desktop').then((m) => ({ default: m.Component })),
);

import { tool as pomodoroTool } from '../../../tools/pomodoro/core';

const pomodoroComponent = lazy(() => import('../../../tools/pomodoro/desktop').then((m) => ({ default: m.Component })));

import { tool as qrcodeTool } from '../../../tools/qr-code/core';

const qrcodeComponent = lazy(() => import('../../../tools/qr-code/desktop').then((m) => ({ default: m.Component })));

import { tool as randompickerTool } from '../../../tools/random-picker/core';

const randompickerComponent = lazy(() =>
  import('../../../tools/random-picker/desktop').then((m) => ({ default: m.Component })),
);

import { tool as readingtimeTool } from '../../../tools/reading-time/core';

const readingtimeComponent = lazy(() =>
  import('../../../tools/reading-time/desktop').then((m) => ({ default: m.Component })),
);

import { tool as regextesterTool } from '../../../tools/regex-tester/core';

const regextesterComponent = lazy(() =>
  import('../../../tools/regex-tester/desktop').then((m) => ({ default: m.Component })),
);

import { tool as screencolorpickerTool } from '../../../tools/screen-color-picker/core';

const screencolorpickerComponent = lazy(() =>
  import('../../../tools/screen-color-picker/desktop').then((m) => ({ default: m.Component })),
);

import { tool as sqlformatterTool } from '../../../tools/sql-formatter/core';

const sqlformatterComponent = lazy(() =>
  import('../../../tools/sql-formatter/desktop').then((m) => ({ default: m.Component })),
);

import { tool as ssldecoderTool } from '../../../tools/ssl-decoder/core';

const ssldecoderComponent = lazy(() =>
  import('../../../tools/ssl-decoder/desktop').then((m) => ({ default: m.Component })),
);

import { tool as texthashTool } from '../../../tools/text-hash/core';

const texthashComponent = lazy(() =>
  import('../../../tools/text-hash/desktop').then((m) => ({ default: m.Component })),
);

import { tool as textstatsTool } from '../../../tools/text-stats/core';

const textstatsComponent = lazy(() =>
  import('../../../tools/text-stats/desktop').then((m) => ({ default: m.Component })),
);

import { tool as tilecalcTool } from '../../../tools/tile-calc/core';

const tilecalcComponent = lazy(() =>
  import('../../../tools/tile-calc/desktop').then((m) => ({ default: m.Component })),
);

import { tool as timestampTool } from '../../../tools/timestamp/core';

const timestampComponent = lazy(() =>
  import('../../../tools/timestamp/desktop').then((m) => ({ default: m.Component })),
);

import { tool as timezoneconverterTool } from '../../../tools/timezone-converter/core';

const timezoneconverterComponent = lazy(() =>
  import('../../../tools/timezone-converter/desktop').then((m) => ({ default: m.Component })),
);

import { tool as tipsplitTool } from '../../../tools/tip-split/core';

const tipsplitComponent = lazy(() =>
  import('../../../tools/tip-split/desktop').then((m) => ({ default: m.Component })),
);

import { tool as unitconverterTool } from '../../../tools/unit-converter/core';

const unitconverterComponent = lazy(() =>
  import('../../../tools/unit-converter/desktop').then((m) => ({ default: m.Component })),
);

import { tool as unitconverterlifeTool } from '../../../tools/unit-converter-life/core';

const unitconverterlifeComponent = lazy(() =>
  import('../../../tools/unit-converter-life/desktop').then((m) => ({ default: m.Component })),
);

import { tool as urlcodecTool } from '../../../tools/url-codec/core';

const urlcodecComponent = lazy(() =>
  import('../../../tools/url-codec/desktop').then((m) => ({ default: m.Component })),
);

import { tool as urlparserTool } from '../../../tools/url-parser/core';

const urlparserComponent = lazy(() =>
  import('../../../tools/url-parser/desktop').then((m) => ({ default: m.Component })),
);

import { tool as uuidgenTool } from '../../../tools/uuid-gen/core';

const uuidgenComponent = lazy(() => import('../../../tools/uuid-gen/desktop').then((m) => ({ default: m.Component })));

import { tool as xmljsonTool } from '../../../tools/xml-json/core';

const xmljsonComponent = lazy(() => import('../../../tools/xml-json/desktop').then((m) => ({ default: m.Component })));

export interface ToolEntry {
  /** The tool's desktop React component (named export `Component`). Lazy-loaded. */
  Component: ComponentType<ToolViewProps<any, any>>;
  /** The tool's core descriptor with a working `run()`. */
  tool: Tool<any, any>;
}

/**
 * Static import map so Vite bundles every tool's component + core.
 * Keyed by each tool's own `id` (read from the imported `tool` object),
 * so the key always matches the registry id even if a folder name differs.
 */
export const toolMap: Record<string, ToolEntry> = {
  [baseconvertTool.id]: { Component: baseconvertComponent, tool: baseconvertTool },
  [base64Tool.id]: { Component: base64Component, tool: base64Tool },
  [base64imageTool.id]: { Component: base64imageComponent, tool: base64imageTool },
  [bmibfrbmrTool.id]: { Component: bmibfrbmrComponent, tool: bmibfrbmrTool },
  [calcTool.id]: { Component: calcComponent, tool: calcTool },
  [caseconvertTool.id]: { Component: caseconvertComponent, tool: caseconvertTool },
  [colorconverterTool.id]: { Component: colorconverterComponent, tool: colorconverterTool },
  [colorpaletteTool.id]: { Component: colorpaletteComponent, tool: colorpaletteTool },
  [compoundinterestTool.id]: { Component: compoundinterestComponent, tool: compoundinterestTool },
  [countdownTool.id]: { Component: countdownComponent, tool: countdownTool },
  [cronparserTool.id]: { Component: cronparserComponent, tool: cronparserTool },
  [cssjsminifyTool.id]: { Component: cssjsminifyComponent, tool: cssjsminifyTool },
  [csvtsvTool.id]: { Component: csvtsvComponent, tool: csvtsvTool },
  [currencyexchangeTool.id]: { Component: currencyexchangeComponent, tool: currencyexchangeTool },
  [curtaincalcTool.id]: { Component: curtaincalcComponent, tool: curtaincalcTool },
  [datecalcTool.id]: { Component: datecalcComponent, tool: datecalcTool },
  [dedupsortTool.id]: { Component: dedupsortComponent, tool: dedupsortTool },
  [difftoolTool.id]: { Component: difftoolComponent, tool: difftoolTool },
  [electricitycostTool.id]: { Component: electricitycostComponent, tool: electricitycostTool },
  [equationsolverTool.id]: { Component: equationsolverComponent, tool: equationsolverTool },
  [fontpreviewTool.id]: { Component: fontpreviewComponent, tool: fontpreviewTool },
  [gradientgenTool.id]: { Component: gradientgenComponent, tool: gradientgenTool },
  [functiongraphTool.id]: { Component: functiongraphComponent, tool: functiongraphTool },
  [graphqlbuilderTool.id]: { Component: graphqlbuilderComponent, tool: graphqlbuilderTool },
  [htmlentityTool.id]: { Component: htmlentityComponent, tool: htmlentityTool },
  [httpcodesTool.id]: { Component: httpcodesComponent, tool: httpcodesTool },
  [invoicetaxTool.id]: { Component: invoicetaxComponent, tool: invoicetaxTool },
  [jsonformatterTool.id]: { Component: jsonformatterComponent, tool: jsonformatterTool },
  [jwtdecoderTool.id]: { Component: jwtdecoderComponent, tool: jwtdecoderTool },
  [markdownpreviewTool.id]: { Component: markdownpreviewComponent, tool: markdownpreviewTool },
  [mortgageTool.id]: { Component: mortgageComponent, tool: mortgageTool },
  [paintfloorTool.id]: { Component: paintfloorComponent, tool: paintfloorTool },
  [passwordgeneratorTool.id]: { Component: passwordgeneratorComponent, tool: passwordgeneratorTool },
  [passwordstrengthTool.id]: { Component: passwordstrengthComponent, tool: passwordstrengthTool },
  [personalbudgetTool.id]: { Component: personalbudgetComponent, tool: personalbudgetTool },
  [placeholdertextTool.id]: { Component: placeholdertextComponent, tool: placeholdertextTool },
  [pomodoroTool.id]: { Component: pomodoroComponent, tool: pomodoroTool },
  [qrcodeTool.id]: { Component: qrcodeComponent, tool: qrcodeTool },
  [randompickerTool.id]: { Component: randompickerComponent, tool: randompickerTool },
  [readingtimeTool.id]: { Component: readingtimeComponent, tool: readingtimeTool },
  [regextesterTool.id]: { Component: regextesterComponent, tool: regextesterTool },
  [screencolorpickerTool.id]: { Component: screencolorpickerComponent, tool: screencolorpickerTool },
  [sqlformatterTool.id]: { Component: sqlformatterComponent, tool: sqlformatterTool },
  [ssldecoderTool.id]: { Component: ssldecoderComponent, tool: ssldecoderTool },
  [texthashTool.id]: { Component: texthashComponent, tool: texthashTool },
  [textstatsTool.id]: { Component: textstatsComponent, tool: textstatsTool },
  [tilecalcTool.id]: { Component: tilecalcComponent, tool: tilecalcTool },
  [timestampTool.id]: { Component: timestampComponent, tool: timestampTool },
  [timezoneconverterTool.id]: { Component: timezoneconverterComponent, tool: timezoneconverterTool },
  [lunarCalendarTool.id]: { Component: lunarCalendarComponent, tool: lunarCalendarTool },
  [alarmTool.id]: { Component: alarmComponent, tool: alarmTool },
  [tipsplitTool.id]: { Component: tipsplitComponent, tool: tipsplitTool },
  [unitconverterTool.id]: { Component: unitconverterComponent, tool: unitconverterTool },
  [unitconverterlifeTool.id]: { Component: unitconverterlifeComponent, tool: unitconverterlifeTool },
  [urlcodecTool.id]: { Component: urlcodecComponent, tool: urlcodecTool },
  [urlparserTool.id]: { Component: urlparserComponent, tool: urlparserTool },
  [uuidgenTool.id]: { Component: uuidgenComponent, tool: uuidgenTool },
  [xmljsonTool.id]: { Component: xmljsonComponent, tool: xmljsonTool },
};

/** Per-tool accent colors 鈥?each tool gets a unique visual identity. */
export const toolAccentColors: Record<string, string> = {
  'base-convert': '#6366F1',
  base64: '#22C55E',
  'base64-image': '#E8751A',
  'bmi-bfr-bmr': '#0EA5E9',
  calc: '#7C3AED',
  'case-convert': '#F59E0B',
  'color-converter': '#14B8A6',
  'color-palette': '#F43F5E',
  'compound-interest': '#8B5CF6',
  'cron-parser': '#10B981',
  'css-js-minify': '#3B82F6',
  'csv-tsv': '#EC4899',
  'currency-exchange': '#84CC16',
  'curtain-calc': '#A855F7',
  'date-calc': '#06B6D4',
  'dedup-sort': '#F97316',
  'diff-tool': '#22C55E',
  'electricity-cost': '#E11D48',
  'equation-solver': '#0EA5E9',
  'font-preview': '#7C3AED',
  'gradient-gen': '#0EA5E9',
  'function-graph': '#10B981',
  'graphql-builder': '#65A30D',
  'html-entity': '#D946EF',
  'http-codes': '#0891B2',
  'invoice-tax': '#CA8A04',
  'json-formatter': '#1A73E8',
  'jwt-decoder': '#DC2626',
  'markdown-preview': '#2563EB',
  mortgage: '#059669',
  'paint-floor': '#C026D3',
  'password-generator': '#EA580C',
  'password-strength': '#16A34A',
  'personal-budget': '#9333EA',
  'placeholder-text': '#0284C7',
  pomodoro: '#B91C1C',
  'qr-code': '#4F46E5',
  'random-picker': '#047857',
  'reading-time': '#DB2777',
  'regex-tester': '#B45309',
  'screen-color-picker': '#1D4ED8',
  'sql-formatter': '#15803D',
  'ssl-decoder': '#A21CAF',
  'text-hash': '#EF4444',
  'text-stats': '#C2410C',
  'tile-calc': '#0D9488',
  timestamp: '#0D9488',
  'timezone-converter': '#BE185D',
  'lunar-calendar': '#E8751A',
  countdown: '#F59E0B',
  alarm: '#DC2626',
  'tip-split': '#1E40AF',
  'unit-converter': '#15803D',
  'unit-converter-life': '#9D174D',
  'url-codec': '#06B6D4',
  'url-parser': '#3730A3',
  'uuid-gen': '#EC4899',
  'xml-json': '#115E59',
};
