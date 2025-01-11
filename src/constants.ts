/* eslint-disable */
export * from '@mapl/router/constants.js';
import { PARAMS, PATH, REQ } from '@mapl/router/constants.js';

// Prefixes
export const MAPL = 'm';

export const HOLDER_PREFIX = '_';
export const HOLDER_0: string = `${HOLDER_PREFIX}0`;

export const CTX: string = `${MAPL}c`;
export const INIT_CTX: string = `${MAPL}i`;
export const HEADERS: string = `${MAPL}h`;
export const C_URL: string = `${MAPL}u`;
export const PATH_START: string = `${MAPL}s`;
export const PATH_END: string = `${MAPL}e`;

// Request context
export const CTX_DEF: string = `let ${CTX}=${INIT_CTX}(${REQ},${HEADERS});`;

// Async
export const ASYNC_START = 'return (async()=>{';
export const ASYNC_END = '})();';

// Default vars
export const TEXT_HEADER_PAIR: string = `${MAPL}tp`;
export const TEXT_OPTIONS: string = `${MAPL}to`;

export const HTML_HEADER_PAIR: string = `${MAPL}hp`;
export const HTML_OPTIONS: string = `${MAPL}ho`;

export const JSON_HEADER_PAIR: string = `${MAPL}jp`;
export const JSON_OPTIONS: string = `${MAPL}jo`;

// Context modification
export const HEADER_DEF: string = `let ${HEADERS}=[];`;

export const SET_TEXT_HEADER: string = `${HEADERS}.push(${TEXT_HEADER_PAIR});`;
export const SET_HTML_HEADER: string = `${HEADERS}.push(${HTML_HEADER_PAIR});`;
export const SET_JSON_HEADER: string = `${HEADERS}.push(${JSON_HEADER_PAIR});`;

export const TEXT_HEADER_DEF: string = `let ${HEADERS}=[${TEXT_HEADER_PAIR}];`;
export const HTML_HEADER_DEF: string = `let ${HEADERS}=[${HTML_HEADER_PAIR}];`;
export const JSON_HEADER_DEF: string = `let ${HEADERS}=[${JSON_HEADER_PAIR}];`;

// Stuff with colon to pass as arguments
export const COLON_CTX: string = `,${CTX}`;

export const COLON_TEXT_OPTIONS: string = `,${TEXT_OPTIONS}`;
export const COLON_HTML_OPTIONS: string = `,${HTML_OPTIONS}`;
export const COLON_JSON_OPTIONS: string = `,${JSON_OPTIONS}`;

// Text & HTML & JSON context creation
export const PLAIN_CTX_DEF: string = HEADER_DEF + CTX_DEF;

export const TEXT_CTX_DEF: string = TEXT_HEADER_DEF + CTX_DEF;
export const HTML_CTX_DEF: string = HTML_HEADER_DEF + CTX_DEF;
export const JSON_CTX_DEF: string = JSON_HEADER_DEF + CTX_DEF;

// Args
export const NO_ARG = '()';
export const ONLY_CTX_ARG: string = `(${CTX})`;
export const ONLY_PARAM_ARG: string = `(${PARAMS})`;
export const ONLY_PAYLOAD_ARG: string = `(${HOLDER_0}[2])`;
export const PAYLOAD_CTX_ARG: string = `(${HOLDER_0}[2]${COLON_CTX})`;
export const PARAM_CTX_ARG: string = `(${PARAMS}${COLON_CTX})`;

// Exception symbol is always the first external value
export const EXCEPT_SYMBOL: string = `${MAPL}s`;
export const EXCEPT_SYMBOL_NAME: string = `${MAPL}n`;

// Static response
const RESPONSE_400 = `${MAPL}br`;
export const RET_400: string = `return ${RESPONSE_400};`;

const RESPONSE_404 = `${MAPL}nf`;
export const RET_404: string = `return ${RESPONSE_404};`;

// Exception constants
export const DEFAULT_EXCEPT_END: string = `default:${RET_400}}`;
export const EXCEPT_START: string = `if(Array.isArray(${HOLDER_0})&&${HOLDER_0}[0]===${EXCEPT_SYMBOL})switch(${HOLDER_0}[1]){`;

// Default vars
export const CONST_VARS: string = `var ${INIT_CTX}=(a,b)=>({status:200,req:a,headers:b}),${EXCEPT_SYMBOL}=Symbol.for('${EXCEPT_SYMBOL_NAME}'),_=['text/plain','text/html','application/json'].map((n)=>['content-type',n]),[${TEXT_HEADER_PAIR},${HTML_HEADER_PAIR},${JSON_HEADER_PAIR}]=_,[${TEXT_OPTIONS},${HTML_OPTIONS},${JSON_OPTIONS}]=_.map((s)=>({headers:s})),[${RESPONSE_400},${RESPONSE_404}]=[400,404].map((s)=>new Response(null,{status:s}));`;

// Parsings and constants
export const PARSE_PATH: string = `let ${C_URL}=${REQ}.url,${PATH_START}=${C_URL}.indexOf('/',12)+1,${PATH_END}=${C_URL}.indexOf('?',${PATH_START}),${PATH}=${C_URL}.substring(${PATH_START},${PATH_END}>>>0);`;

// Required values for capturing
export const CAPTURE_ARGS: string = `,${REQ},${C_URL},${PATH_START},${PATH_END}`;

// Inject others
export const ORIGIN: string = `${MAPL}o`;
