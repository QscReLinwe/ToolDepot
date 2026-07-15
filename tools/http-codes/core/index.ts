import type { ToolOutput } from '@tooldepot/types';

export interface HttpCode {
  code: number;
  name: string;
  description: string;
  category: string;
}

export interface HttpCodesInput {
  query?: string;
  code?: number;
}

export interface HttpCodesOutput {
  results: HttpCode[];
}

const HTTP_CODES: HttpCode[] = [
  {
    code: 100,
    name: 'Continue',
    description: 'The server has received the request headers and the client should proceed to send the request body.',
    category: 'Informational',
  },
  {
    code: 101,
    name: 'Switching Protocols',
    description: 'The requester has asked the server to switch protocols and the server has agreed to do so.',
    category: 'Informational',
  },
  {
    code: 102,
    name: 'Processing',
    description: 'The server has received and is processing the request, but no response is available yet.',
    category: 'Informational',
  },
  {
    code: 103,
    name: 'Early Hints',
    description: 'Used to return some response headers before the final HTTP message.',
    category: 'Informational',
  },
  { code: 200, name: 'OK', description: 'The request has succeeded.', category: 'Success' },
  {
    code: 201,
    name: 'Created',
    description: 'The request has been fulfilled and a new resource has been created.',
    category: 'Success',
  },
  {
    code: 202,
    name: 'Accepted',
    description: 'The request has been accepted for processing, but the processing has not been completed.',
    category: 'Success',
  },
  {
    code: 203,
    name: 'Non-Authoritative Information',
    description: 'The server successfully processed the request, but is returning information from another source.',
    category: 'Success',
  },
  {
    code: 204,
    name: 'No Content',
    description: 'The server successfully processed the request and is not returning any content.',
    category: 'Success',
  },
  {
    code: 205,
    name: 'Reset Content',
    description: 'The server successfully processed the request and asks the client to reset the document view.',
    category: 'Success',
  },
  {
    code: 206,
    name: 'Partial Content',
    description: 'The server is delivering only part of the resource due to a range header sent by the client.',
    category: 'Success',
  },
  {
    code: 207,
    name: 'Multi-Status',
    description:
      'Conveys information about multiple resources in situations where multiple status codes might be appropriate.',
    category: 'Success',
  },
  {
    code: 208,
    name: 'Already Reported',
    description: 'The members of a DAV binding have already been enumerated in a previous reply.',
    category: 'Success',
  },
  {
    code: 226,
    name: 'IM Used',
    description:
      'The server has fulfilled a request for the resource, and the response is a representation of the result of one or more instance-manipulations.',
    category: 'Success',
  },
  {
    code: 300,
    name: 'Multiple Choices',
    description: 'The request has more than one possible response and the user agent should choose one.',
    category: 'Redirection',
  },
  {
    code: 301,
    name: 'Moved Permanently',
    description: 'The requested resource has been permanently moved to a new URL.',
    category: 'Redirection',
  },
  {
    code: 302,
    name: 'Found',
    description: 'The requested resource resides temporarily under a different URL.',
    category: 'Redirection',
  },
  {
    code: 303,
    name: 'See Other',
    description: 'The response can be found under a different URL and should be retrieved using a GET.',
    category: 'Redirection',
  },
  {
    code: 304,
    name: 'Not Modified',
    description: 'The resource has not been modified since the version specified by the request headers.',
    category: 'Redirection',
  },
  {
    code: 307,
    name: 'Temporary Redirect',
    description: 'The request should be repeated with another URL but the method must not change.',
    category: 'Redirection',
  },
  {
    code: 308,
    name: 'Permanent Redirect',
    description:
      'The request and all future requests should be repeated using another URL and the method must not change.',
    category: 'Redirection',
  },
  {
    code: 400,
    name: 'Bad Request',
    description: 'The server could not understand the request due to invalid syntax.',
    category: 'Client Error',
  },
  {
    code: 401,
    name: 'Unauthorized',
    description: 'The client must authenticate itself to get the requested response.',
    category: 'Client Error',
  },
  {
    code: 402,
    name: 'Payment Required',
    description: 'Reserved for future use; originally intended for digital payment systems.',
    category: 'Client Error',
  },
  {
    code: 403,
    name: 'Forbidden',
    description: 'The client does not have access rights to the content.',
    category: 'Client Error',
  },
  {
    code: 404,
    name: 'Not Found',
    description: 'The server can not find the requested resource.',
    category: 'Client Error',
  },
  {
    code: 405,
    name: 'Method Not Allowed',
    description: 'The request method is known by the server but has been disabled and cannot be used.',
    category: 'Client Error',
  },
  {
    code: 406,
    name: 'Not Acceptable',
    description: 'The server cannot produce a response matching the list of acceptable values in the request headers.',
    category: 'Client Error',
  },
  {
    code: 408,
    name: 'Request Timeout',
    description: 'The server timed out waiting for the request.',
    category: 'Client Error',
  },
  {
    code: 409,
    name: 'Conflict',
    description: 'The request conflicts with the current state of the server.',
    category: 'Client Error',
  },
  {
    code: 410,
    name: 'Gone',
    description: 'The requested content has been permanently deleted from the server.',
    category: 'Client Error',
  },
  {
    code: 413,
    name: 'Payload Too Large',
    description: 'The request entity is larger than limits defined by the server.',
    category: 'Client Error',
  },
  {
    code: 415,
    name: 'Unsupported Media Type',
    description: 'The media format of the requested data is not supported by the server.',
    category: 'Client Error',
  },
  {
    code: 418,
    name: "I'm a Teapot",
    description: 'The server refuses the attempt to brew coffee with a teapot.',
    category: 'Client Error',
  },
  {
    code: 422,
    name: 'Unprocessable Entity',
    description: 'The request was well-formed but contained semantic errors.',
    category: 'Client Error',
  },
  {
    code: 429,
    name: 'Too Many Requests',
    description: 'The user has sent too many requests in a given amount of time (rate limiting).',
    category: 'Client Error',
  },
  {
    code: 431,
    name: 'Request Header Fields Too Large',
    description: 'The server is unwilling to process the request because the header fields are too large.',
    category: 'Client Error',
  },
  {
    code: 500,
    name: 'Internal Server Error',
    description: 'The server has encountered a situation it does not know how to handle.',
    category: 'Server Error',
  },
  {
    code: 501,
    name: 'Not Implemented',
    description: 'The request method is not supported by the server and cannot be handled.',
    category: 'Server Error',
  },
  {
    code: 502,
    name: 'Bad Gateway',
    description: 'The server received an invalid response from the upstream server.',
    category: 'Server Error',
  },
  {
    code: 503,
    name: 'Service Unavailable',
    description: 'The server is not ready to handle the request, often due to maintenance or overload.',
    category: 'Server Error',
  },
  {
    code: 504,
    name: 'Gateway Timeout',
    description: 'The server did not receive a timely response from the upstream server.',
    category: 'Server Error',
  },
  {
    code: 505,
    name: 'HTTP Version Not Supported',
    description: 'The HTTP version used in the request is not supported by the server.',
    category: 'Server Error',
  },
  {
    code: 507,
    name: 'Insufficient Storage',
    description: 'The server is unable to store the representation needed to complete the request.',
    category: 'Server Error',
  },
  {
    code: 508,
    name: 'Loop Detected',
    description: 'The server detected an infinite loop while processing the request.',
    category: 'Server Error',
  },
  {
    code: 511,
    name: 'Network Authentication Required',
    description: 'The client needs to authenticate to gain network access.',
    category: 'Server Error',
  },
];

export const tool = {
  id: 'http-codes',
  name: 'HTTP 状态码',
  description: '按状态码、名称或描述查询 HTTP 状态码。',
  category: 'dev',
  async run(input: HttpCodesInput): Promise<ToolOutput<HttpCodesOutput>> {
    const code = input?.code;
    const query = input?.query?.trim();

    if (code !== undefined && code !== null) {
      const num = Number(code);
      if (!Number.isInteger(num) || num < 100 || num > 599) {
        return { ok: false, error: 'code must be an integer between 100 and 599' };
      }
      const found = HTTP_CODES.filter((c) => c.code === num);
      return { ok: true, data: { results: found }, mimeType: 'application/json' };
    }

    if (query) {
      const q = query.toLowerCase();
      const found = HTTP_CODES.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          String(c.code).includes(q),
      );
      return { ok: true, data: { results: found }, mimeType: 'application/json' };
    }

    // No filters: return the full list for browsing.
    return { ok: true, data: { results: HTTP_CODES }, mimeType: 'application/json' };
  },
};

export default tool;
