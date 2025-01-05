export * from '@mapl/router/constants.js';
import { PARAMS, PATH, REQ } from '@mapl/router/constants.js';

// Prefixes
export const MAPL = 'm';

export const HOLDER_PREFIX = '_';
export const HOLDER_0 = `${HOLDER_PREFIX}0`;

export const CTX = `${MAPL}c`;
export const HEADERS = `${MAPL}h`;
export const C_URL = `${MAPL}u`;
export const PATH_START = `${MAPL}s`;
export const PATH_END = `${MAPL}e`;

// Request context
export const CTX_DEF = `let ${CTX}={status:200,req:${REQ},headers:${HEADERS}};`;

// Async
export const ASYNC_START = 'return (async()=>{';
export const ASYNC_END = '})();';

// Default vars
export const TEXT_HEADER_PAIR = `${MAPL}tp`;
export const TEXT_OPTIONS = `${MAPL}to`;

export const HTML_HEADER_PAIR = `${MAPL}hp`;
export const HTML_OPTIONS = `${MAPL}ho`;

export const JSON_HEADER_PAIR = `${MAPL}jp`;
export const JSON_OPTIONS = `${MAPL}jo`;

// Context modification
export const HEADER_DEF = `let ${HEADERS}=[];`;

export const SET_TEXT_HEADER = `${HEADERS}.push(${TEXT_HEADER_PAIR});`;
export const SET_HTML_HEADER = `${HEADERS}.push(${HTML_HEADER_PAIR});`;
export const SET_JSON_HEADER = `${HEADERS}.push(${JSON_HEADER_PAIR});`;

export const TEXT_HEADER_DEF = `let ${HEADERS}=[${TEXT_HEADER_PAIR}];`;
export const HTML_HEADER_DEF = `let ${HEADERS}=[${HTML_HEADER_PAIR}];`;
export const JSON_HEADER_DEF = `let ${HEADERS}=[${JSON_HEADER_PAIR}];`;

// Stuff with colon to pass as arguments
export const COLON_CTX = `,${CTX}`;

export const COLON_TEXT_OPTIONS = `,${TEXT_OPTIONS}`;
export const COLON_HTML_OPTIONS = `,${HTML_OPTIONS}`;
export const COLON_JSON_OPTIONS = `,${JSON_OPTIONS}`;

// Text & HTML & JSON context creation
export const PLAIN_CTX_DEF = HEADER_DEF + CTX_DEF;

export const TEXT_CTX_DEF = TEXT_HEADER_DEF + CTX_DEF;
export const HTML_CTX_DEF = HTML_HEADER_DEF + CTX_DEF;
export const JSON_CTX_DEF = JSON_HEADER_DEF + CTX_DEF;

// Args
export const NO_ARG = '()';
export const ONLY_CTX_ARG = `(${CTX})`;
export const ONLY_PARAM_ARG = `(${PARAMS})`;
export const ONLY_PAYLOAD_ARG = `(${HOLDER_0}[2])`;
export const PAYLOAD_CTX_ARG = `(${HOLDER_0}[2]${COLON_CTX})`;
export const PARAM_CTX_ARG = `(${PARAMS}${COLON_CTX})`;

// Exception symbol is always the first external value
export const EXCEPT_SYMBOL = `${MAPL}s`;
export const EXCEPT_SYMBOL_NAME = `${MAPL}n`;

// Static response
const RESPONSE_400 = `${MAPL}br`;
export const RET_400 = `return ${RESPONSE_400};`;

const RESPONSE_404 = `${MAPL}nf`;
export const RET_404 = `return ${RESPONSE_404};`;

// Exception constants
export const DEFAULT_EXCEPT_END = `default:${RET_400}}`;
export const EXCEPT_START = `if(Array.isArray(${HOLDER_0})&&${HOLDER_0}[0]===${EXCEPT_SYMBOL})switch(${HOLDER_0}[1]){`;

// Default vars
export const CONST_VARS = `var ${EXCEPT_SYMBOL}=Symbol.for('${EXCEPT_SYMBOL_NAME}'),_=['text/plain','text/html','application/json'].map((n)=>['content-type',n]),[${TEXT_HEADER_PAIR},${HTML_HEADER_PAIR},${JSON_HEADER_PAIR}]=_,[${TEXT_OPTIONS},${HTML_OPTIONS},${JSON_OPTIONS}]=_.map((s)=>({headers:s})),[${RESPONSE_400},${RESPONSE_404}]=[400,404].map((s)=>new Response(null,{status:s}));`;

// Parsings and constants
export const PARSE_PATH = `let ${C_URL}=${REQ}.url,${PATH_START}=${C_URL}.indexOf('/',12)+1,${PATH_END}=${C_URL}.indexOf('?',${PATH_START}),${PATH}=${C_URL}.substring(${PATH_START},${PATH_END}>>>0);`;

// Required values for capturing
export const CAPTURE_ARGS = `,${REQ},${C_URL},${PATH_START},${PATH_END}`;
