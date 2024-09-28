import { PATH, REQ } from '@mapl/router/constants';

export const MAPL = '__mapl';
export const CTX = `${MAPL}_rc`;
export const METHOD = `${MAPL}_m`;
export const C_URL = `${MAPL}_u`;
export const PATH_START = `${MAPL}_ps`;
export const PATH_END = `${MAPL}_pe`;

// Default vars
export const HTML_HEADER_PAIR = `${MAPL}_htmlhp`;
export const HTML_OPTIONS = `${MAPL}_htmlo`;

export const JSON_HEADER_PAIR = `${MAPL}_jsonhp`;
export const JSON_OPTIONS = `${MAPL}_jsono`;

// Exception symbol is always the first external value
export const EXCEPT_SYMBOL = 'f0';
export const RESPONSE_400 = `${MAPL}_r400`;
export const RESPONSE_404 = `${MAPL}_r404`;
export const VAR_PREFIX = `${MAPL}_v_`;

export const CONST_VARS = `const ${HTML_HEADER_PAIR}=['content-type','text/html'],${HTML_OPTIONS}={headers:[${HTML_HEADER_PAIR}]},${JSON_HEADER_PAIR}=['content-type','application/json'],${JSON_OPTIONS}={headers:[${JSON_HEADER_PAIR}]},${RESPONSE_400}=new Response(null,{status:400}),${RESPONSE_404}=new Response(null,{status:404});`;

// Request context
export const CTX_DEF = `const ${CTX}={status:200,req:${REQ}`;
export const CTX_END = '};';

// Parsings and constants
export const PARSE_PATH = `const ${C_URL}=${REQ}.url,${PATH_START}=${C_URL}.indexOf('/',12)+1,${PATH_END}=${C_URL}.indexOf('?',${PATH_START}),${PATH}=${PATH_END}===-1?${C_URL}.slice(${PATH_START}):${C_URL}.substring(${PATH_START},${PATH_END});`;
