import { Tokenizer } from '@streamparser/json';
import { PassThrough } from 'stream';

/**
 * createNDJSONTokenizer
 * Builds a streamparser/json tokenizer configured to emit full JSON objects
 * from an NDJSON stream (one JSON object separated by whitespace/newlines).
 */
export function createNDJSONTokenizer(onObject: (obj: any) => void) {
  const tokenizer = new Tokenizer({ stringBufferSize: undefined });
  let depth = 0;
  let stack: any[] = [];
  let currentKey: string | null = null;

  // Adapt to current @streamparser/json API expecting ParsedTokenInfo { token, value }
  // Keep backward compatibility if library still passes (token, value)
  tokenizer.onToken = (arg1: any, arg2?: any) => {
    let token: any;
    let value: any;
    if (typeof arg1 === 'object' && arg1 && 'token' in arg1) {
      token = arg1.token;
      value = (arg1 as any).value;
    } else {
      token = arg1;
      value = arg2;
    }
    switch (token) {
      case 'startObject':
        depth++;
        stack.push({});
        break;
      case 'endObject': {
        const obj = stack.pop();
        depth--;
        if (depth === 0) {
          onObject(obj);
        } else {
          // append to parent (array or object?)
          appendValue(obj);
        }
        break;
      }
      case 'startArray':
        depth++;
        stack.push([]);
        break;
      case 'endArray': {
        const arr = stack.pop();
        depth--;
        if (depth === 0) {
          onObject(arr);
        } else {
          appendValue(arr);
        }
        break;
      }
      case 'keyValue':
        currentKey = value;
        break;
      case 'stringValue':
      case 'numberValue':
      case 'nullValue':
      case 'trueValue':
      case 'falseValue':
        appendValue(value);
        break;
    }
  };

  function appendValue(val: any) {
    const container = stack[stack.length - 1];
    if (Array.isArray(container)) {
      container.push(val);
    } else if (container && currentKey != null) {
      container[currentKey] = val;
      currentKey = null;
    }
  }

  return tokenizer;
}

/**
 * pipeReadableToTokenizer
 * Utility to pipe a Node.js readable stream (fetch body) into the tokenizer.
 */
export async function pipeReadableToTokenizer(readable: NodeJS.ReadableStream, tokenizer: Tokenizer) {
  for await (const chunk of readable) {
    tokenizer.write(chunk);
  }
}
