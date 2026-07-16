import type { Tool, ToolOutput } from '@tooldepot/types';

export interface SslDecoderInput {
  /** PEM-encoded X.509 certificate (BEGIN CERTIFICATE ... END CERTIFICATE). */
  pem: string;
}

export interface SslDecoderOutput {
  valid: boolean;
  error?: string;
  subject?: Record<string, string>;
  issuer?: Record<string, string>;
  validFrom?: string;
  validTo?: string;
  serialNumber?: string;
  fingerprintSha1?: string;
  daysRemaining?: number;
}

// ---- ASN.1 DER primitives ----

interface Asn1Node {
  cls: number; // 0 universal, 1 application, 2 context, 3 private
  constructed: boolean;
  tag: number;
  value: Uint8Array;
  children: Asn1Node[];
}

class Reader {
  private data: Uint8Array;
  private pos = 0;
  constructor(data: Uint8Array) {
    this.data = data;
  }
  readByte(): number {
    if (this.pos >= this.data.length) throw new Error('Unexpected end of ASN.1 data');
    return this.data[this.pos++]!;
  }
  read(length: number): Uint8Array {
    if (this.pos + length > this.data.length) throw new Error('Unexpected end of ASN.1 data');
    const slice = this.data.subarray(this.pos, this.pos + length);
    this.pos += length;
    return slice;
  }
  get done(): boolean {
    return this.pos >= this.data.length;
  }
}

function parseTLV(reader: Reader): Asn1Node {
  const tagByte = reader.readByte();
  const cls = tagByte >> 6;
  const constructed = (tagByte & 0x20) !== 0;
  let tag = tagByte & 0x1f;
  if (tag === 0x1f) {
    tag = 0;
    let b: number;
    do {
      b = reader.readByte();
      tag = (tag << 7) | (b & 0x7f);
    } while (b & 0x80);
  }
  const lenByte = reader.readByte();
  let length: number;
  if (lenByte < 0x80) {
    length = lenByte;
  } else if (lenByte === 0x80) {
    throw new Error('Indefinite ASN.1 length is not supported');
  } else {
    const numBytes = lenByte & 0x7f;
    length = 0;
    for (let i = 0; i < numBytes; i++) {
      length = (length << 8) | reader.readByte();
    }
  }
  const value = reader.read(length);
  const children: Asn1Node[] = [];
  if (constructed) {
    const sub = new Reader(value);
    while (!sub.done) children.push(parseTLV(sub));
  }
  return { cls, constructed, tag, value, children };
}

function _findChild(node: Asn1Node, cls: number, tag: number): Asn1Node | undefined {
  return node.children.find((c) => c.cls === cls && c.tag === tag);
}

function bytesToText(bytes: Uint8Array): string {
  try {
    if (typeof TextDecoder !== 'undefined') {
      return new TextDecoder('utf-8').decode(bytes);
    }
  } catch {
    /* fall through to latin1 */
  }
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]!);
  return s;
}

function decodeOid(bytes: Uint8Array): string {
  if (bytes.length === 0) return '';
  const parts: number[] = [];
  let value = 0;
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i]!;
    value = (value << 7) | (b & 0x7f);
    if ((b & 0x80) === 0) {
      parts.push(value);
      value = 0;
    }
  }
  if (parts.length >= 2) {
    const first = parts[0]!;
    const x = Math.floor(first / 40);
    const y = first % 40;
    return [x, y, ...parts.slice(1)].join('.');
  }
  return parts.join('.');
}

const OID_NAMES: Record<string, string> = {
  '2.5.4.3': 'CN',
  '2.5.4.4': 'SN',
  '2.5.4.5': 'serialNumber',
  '2.5.4.6': 'C',
  '2.5.4.7': 'L',
  '2.5.4.8': 'ST',
  '2.5.4.9': 'STREET',
  '2.5.4.10': 'O',
  '2.5.4.11': 'OU',
  '2.5.4.97': 'organizationIdentifier',
  '1.2.840.113549.1.9.1': 'emailAddress',
  '0.9.2342.19200300.100.1.25': 'domainComponent',
};

function parseName(nameNode: Asn1Node): Record<string, string> {
  const result: Record<string, string> = {};
  for (const rdn of nameNode.children) {
    for (const atv of rdn.children) {
      const oidNode = atv.children[0];
      const valNode = atv.children[1];
      if (!oidNode || !valNode) continue;
      const oid = decodeOid(oidNode.value);
      const key = OID_NAMES[oid] || oid;
      const text = bytesToText(valNode.value);
      if (result[key]) result[key] += `, ${text}`;
      else result[key] = text;
    }
  }
  return result;
}

function parseTime(node: Asn1Node): string {
  const text = bytesToText(node.value).replace(/Z$/, '');
  let year: number;
  let month: number;
  let day: number;
  let hour: number;
  let min: number;
  let sec: number;
  if (node.tag === 23) {
    // UTCTime: YYMMDDHHMMSS
    const yy = parseInt(text.slice(0, 2), 10);
    year = yy >= 50 ? 1900 + yy : 2000 + yy;
    month = parseInt(text.slice(2, 4), 10);
    day = parseInt(text.slice(4, 6), 10);
    hour = parseInt(text.slice(6, 8), 10);
    min = parseInt(text.slice(8, 10), 10);
    sec = parseInt(text.slice(10, 12), 10);
  } else {
    // GeneralizedTime: YYYYMMDDHHMMSS
    year = parseInt(text.slice(0, 4), 10);
    month = parseInt(text.slice(4, 6), 10);
    day = parseInt(text.slice(6, 8), 10);
    hour = parseInt(text.slice(8, 10), 10);
    min = parseInt(text.slice(10, 12), 10);
    sec = parseInt(text.slice(12, 14), 10);
  }
  const d = new Date(Date.UTC(year, month - 1, day, hour, min, sec));
  return d.toISOString();
}

function toHex(bytes: Uint8Array): string {
  const parts: string[] = [];
  for (let i = 0; i < bytes.length; i++) {
    parts.push(bytes[i]!.toString(16).padStart(2, '0'));
  }
  return parts.join(':').toUpperCase();
}

function base64ToBytes(b64: string): Uint8Array {
  const clean = b64.replace(/[^A-Za-z0-9+/=]/g, '');
  const lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const out: number[] = [];
  let i = 0;
  while (i < clean.length) {
    const a = lookup.indexOf(clean[i++]!);
    const b = lookup.indexOf(clean[i++]!);
    const c = lookup.indexOf(clean[i++]!);
    const d = lookup.indexOf(clean[i++]!);
    const n = ((a << 18) | (b << 12) | (c << 6) | d) >>> 0;
    out.push((n >> 16) & 0xff);
    if (c === -1) break;
    out.push((n >> 8) & 0xff);
    if (d === -1) break;
    out.push(n & 0xff);
  }
  return new Uint8Array(out);
}

function sha1(bytes: Uint8Array): string {
  const H = [0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0];
  const ml = bytes.length * 8;
  const total = Math.ceil((bytes.length + 1 + 8) / 64) * 64;
  const padded = new Uint8Array(total);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(total - 4, ml >>> 0, false);
  view.setUint32(total - 8, Math.floor(ml / 0x100000000), false);
  const w = new Uint32Array(80);
  for (let i = 0; i < total; i += 64) {
    for (let t = 0; t < 16; t++) w[t] = view.getUint32(i + t * 4, false);
    for (let t = 16; t < 80; t++) {
      const n = w[t - 3]! ^ w[t - 8]! ^ w[t - 14]! ^ w[t - 16]!;
      w[t] = (n << 1) | (n >>> 31);
    }
    let a = H[0]!;
    let b = H[1]!;
    let c = H[2]!;
    let d = H[3]!;
    let e = H[4]!;
    for (let t = 0; t < 80; t++) {
      let f: number;
      let k: number;
      if (t < 20) {
        f = (b & c) | (~b & d);
        k = 0x5a827999;
      } else if (t < 40) {
        f = b ^ c ^ d;
        k = 0x6ed9eba1;
      } else if (t < 60) {
        f = (b & c) | (b & d) | (c & d);
        k = 0x8f1bbcdc;
      } else {
        f = b ^ c ^ d;
        k = 0xca62c1d6;
      }
      const temp = (((a << 5) | (a >>> 27)) + f + e + k + w[t]!) >>> 0;
      e = d;
      d = c;
      c = (b << 30) | (b >>> 2);
      b = a;
      a = temp;
    }
    H[0] = (H[0]! + a) >>> 0;
    H[1] = (H[1]! + b) >>> 0;
    H[2] = (H[2]! + c) >>> 0;
    H[3] = (H[3]! + d) >>> 0;
    H[4] = (H[4]! + e) >>> 0;
  }
  return H.map((h) => h.toString(16).padStart(8, '0'))
    .join('')
    .toUpperCase();
}

export const tool: Tool<SslDecoderInput, SslDecoderOutput> = {
  id: 'ssl-decoder',
  name: 'SSL 证书解码',
  description: '解码与查看 SSL/TLS 证书详情。',
  category: 'crypto',
  async run(input: SslDecoderInput): Promise<ToolOutput<SslDecoderOutput>> {
    const pem = input?.pem;
    if (!pem || typeof pem !== 'string') {
      return { ok: false, error: 'Missing required field: pem' };
    }
    const match = pem.match(/-----BEGIN CERTIFICATE-----([\s\S]*?)-----END CERTIFICATE-----/i);
    if (!match) {
      return { ok: true, data: { valid: false, error: 'Invalid PEM: missing BEGIN/END CERTIFICATE markers' } };
    }

    try {
      const der = base64ToBytes(match[1] ?? '');
      const cert = parseTLV(new Reader(der));
      if (cert.tag !== 16 || !cert.constructed) {
        throw new Error('Top-level structure is not a SEQUENCE');
      }
      const tbs = cert.children[0];
      if (tbs?.tag !== 16) {
        throw new Error('Missing TBSCertificate');
      }

      const children = tbs.children;
      let idx = 0;
      if (children[0] && children[0].cls === 2 && children[0].tag === 0) {
        idx = 1; // skip explicit [0] version
      }
      const serialNode = children[idx++];
      idx++; // signature algorithm
      const issuerNode = children[idx++];
      const validityNode = children[idx++];
      const subjectNode = children[idx++];

      if (!serialNode || !issuerNode || !validityNode || !subjectNode) {
        throw new Error('Certificate structure is missing expected fields');
      }

      const subject = parseName(subjectNode);
      const issuer = parseName(issuerNode);
      const validFrom = parseTime(validityNode.children[0]!);
      const validTo = parseTime(validityNode.children[1]!);
      const serialNumber = toHex(serialNode.value);
      const fingerprintSha1 = sha1(der);

      const now = Date.now();
      const validToMs = new Date(validTo).getTime();
      const daysRemaining = Math.floor((validToMs - now) / 86_400_000);

      return {
        ok: true,
        data: {
          valid: true,
          subject,
          issuer,
          validFrom,
          validTo,
          serialNumber,
          fingerprintSha1,
          daysRemaining,
        },
        mimeType: 'application/json',
      };
    } catch (e) {
      return {
        ok: true,
        data: { valid: false, error: e instanceof Error ? e.message : String(e) },
      };
    }
  },
};

export default tool;
