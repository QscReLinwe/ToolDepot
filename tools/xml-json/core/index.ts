import type { Tool, ToolOutput } from '@tooldepot/types';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';

export type XmlJsonMode = 'xml2json' | 'json2xml';

export interface XmlJsonInput {
  mode: XmlJsonMode;
  text: string;
}

export interface XmlJsonOutput {
  result: string;
  error?: string;
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  parseTagValue: true,
  trimValues: true,
});

const builder = new XMLBuilder({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  format: true,
  indentBy: '  ',
  suppressEmptyNode: false,
});

export const tool: Tool<XmlJsonInput, XmlJsonOutput> = {
  id: 'xml-json',
  name: 'XML / JSON 转换',
  description: '在 XML 与 JSON 间转换。',
  category: 'convert',
  async run(input: XmlJsonInput): Promise<ToolOutput<XmlJsonOutput>> {
    const mode = input?.mode;
    const text = input?.text;

    if (!mode || !['xml2json', 'json2xml'].includes(mode)) {
      return { ok: false, error: 'Invalid or missing mode (expected xml2json|json2xml)' };
    }
    if (typeof text !== 'string') {
      return { ok: false, error: 'Missing required field: text' };
    }

    try {
      if (mode === 'xml2json') {
        const parsed = parser.parse(text);
        const result = JSON.stringify(parsed, null, 2);
        return { ok: true, data: { result }, mimeType: 'application/json' };
      }

      // json2xml
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch (e) {
        return { ok: false, error: `Invalid JSON input: ${e instanceof Error ? e.message : String(e)}` };
      }
      const result = builder.build(parsed);
      return { ok: true, data: { result }, mimeType: 'application/xml' };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  },
};

export default tool;
