export * from '@mapl/router/constants.js';
import { PARAMS, PATH, REQ } from '@mapl/router/constants.js';

// Prefixes
export const MAPL = '__mapl';

export const HOLDER = `${MAPL}_ph`;
export const CREATE_HOLDER = `let ${HOLDER}`;

export const CTX = `${MAPL}_rc`;
export const METHOD = `${MAPL}_m`;
export const HEADERS = `${MAPL}_h`;
export const C_URL = `${MAPL}_u`;
export const PATH_START = `${MAPL}_ps`;
export const PATH_END = `${MAPL}_pe`;

// Request context
export const CTX_DEF = `let ${CTX}={status:200,req:${REQ},headers:${HEADERS}};`;
export const CTX_PARAMS_DEF = `let ${CTX}={status:200,req:${REQ},headers:${HEADERS},params:${PARAMS}};`;

// Async
export const ASYNC_START = 'return (async()=>{';
export const ASYNC_END = '})();';

// Default vars
export const HTML_HEADER_PAIR = `${MAPL}_htmlhp`;
export const HTML_OPTIONS = `${MAPL}_htmlo`;

export const JSON_HEADER_PAIR = `${MAPL}_jsonhp`;
export const JSON_OPTIONS = `${MAPL}_jsono`;

// Context modification
export const TEXT_HEADER_DEF = `let ${HEADERS}=[];`;

export const SET_HTML_HEADER = `${HEADERS}.push(${HTML_HEADER_PAIR});`;
export const SET_JSON_HEADER = `${HEADERS}.push(${JSON_HEADER_PAIR});`;

export const HTML_HEADER_DEF = `let ${HEADERS}=[${HTML_HEADER_PAIR}];`;
export const JSON_HEADER_DEF = `let ${HEADERS}=[${JSON_HEADER_PAIR}];`;

// Stuff with colon to pass as arguments
export const COLON_CTX = `,${CTX}`;
export const COLON_HTML_OPTIONS = `,${HTML_OPTIONS}`;
export const COLON_JSON_OPTIONS = `,${JSON_OPTIONS}`;

// Args
export const NO_ARG = '()';
export const ONLY_CTX_ARG = `(${CTX})`;
export const ONLY_PAYLOAD_ARG = `(${HOLDER}[2])`;
export const PAYLOAD_CTX_ARG = `(${HOLDER}[2]${COLON_CTX})`;

// Exception symbol is always the first external value
export const EXCEPT_SYMBOL = 'f0';

// Static response
const RESPONSE_400 = `${MAPL}_r400`;
export const RET_400 = `return ${RESPONSE_400};`;

const RESPONSE_404 = `${MAPL}_r404`;
export const RET_404 = `return ${RESPONSE_404};`;

const RESPONSE_500 = `${MAPL}_r500`;
export const RET_500 = `return ${RESPONSE_500};`;

// Exception constants
export const DEFAULT_EXCEPT_END = `default:${RET_500}}`;
export const EXCEPT_START = `if(Array.isArray(${HOLDER})&&${HOLDER}[0]===${EXCEPT_SYMBOL})switch(${HOLDER}[1]){`;

// Text & HTML & JSON context creation
export const TEXT_CTX_DEF = TEXT_HEADER_DEF + CTX_DEF;
export const HTML_CTX_DEF = HTML_HEADER_DEF + CTX_DEF;
export const JSON_CTX_DEF = JSON_HEADER_DEF + CTX_DEF;

// Default vars
export const CONST_VARS = `var ${HTML_HEADER_PAIR}=['content-type','text/html'],${HTML_OPTIONS}={headers:[${HTML_HEADER_PAIR}]},${JSON_HEADER_PAIR}=['content-type','application/json'],${JSON_OPTIONS}={headers:[${JSON_HEADER_PAIR}]},${RESPONSE_400}=new Response(null,{status:400}),${RESPONSE_404}=new Response(null,{status:404}),${RESPONSE_500}=new Response(null,{status:500});`;

// Parsings and constants
export const PARSE_PATH = `let ${C_URL}=${REQ}.url,${PATH_START}=${C_URL}.indexOf('/',12)+1,${PATH_END}=${C_URL}.indexOf('?',${PATH_START}),${PATH}=${PATH_END}===-1?${C_URL}.slice(${PATH_START}):${C_URL}.substring(${PATH_START},${PATH_END});`;
