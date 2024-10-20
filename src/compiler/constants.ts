import { PARAMS, PATH, REQ } from '@mapl/router/constants.js';

// Prefixes
export const MAPL = '__mapl';
export const VAR_PREFIX = `${MAPL}_v`;

export const CTX = `${MAPL}_rc`;
export const METHOD = `${MAPL}_m`;
export const HEADERS = `${MAPL}_h`;
export const C_URL = `${MAPL}_u`;
export const PATH_START = `${MAPL}_ps`;
export const PATH_END = `${MAPL}_pe`;

// Request context
export const CTX_DEF = `let ${CTX}={status:200,req:${REQ},headers:${HEADERS}`;
export const CTX_PARAM_DEF = `,params:${PARAMS}`;
export const CTX_END = '};';

// Async
export const ASYNC_START = 'return (async()=>{';

// Default vars
export const HTML_HEADER_PAIR = `${MAPL}_htmlhp`;
export const HTML_OPTIONS = `${MAPL}_htmlo`;

export const JSON_HEADER_PAIR = `${MAPL}_jsonhp`;
export const JSON_OPTIONS = `${MAPL}_jsono`;

// Context modification
export const CREATE_EMPTY_HEADER = `let ${HEADERS}=[];`;
export const SET_HTML_HEADER = `${HEADERS}.push(${HTML_HEADER_PAIR});`;
export const SET_JSON_HEADER = `${HEADERS}.push(${JSON_HEADER_PAIR});`;

// Exception symbol is always the first external value
export const EXCEPT_SYMBOL = 'f0';

const RESPONSE_400 = `${MAPL}_r400`;
export const RET_400 = `return ${RESPONSE_400};`;

const RESPONSE_404 = `${MAPL}_r404`;
export const RET_404 = `return ${RESPONSE_404};`;

const RESPONSE_500 = `${MAPL}_r500`;
export const RET_500 = `return ${RESPONSE_500};`;

export const CONST_VARS = `var ${HTML_HEADER_PAIR}=['content-type','text/html'],${HTML_OPTIONS}={headers:[${HTML_HEADER_PAIR}]},${JSON_HEADER_PAIR}=['content-type','application/json'],${JSON_OPTIONS}={headers:[${JSON_HEADER_PAIR}]},${RESPONSE_400}=new Response(null,{status:400}),${RESPONSE_404}=new Response(null,{status:404}),${RESPONSE_500}=new Response(null,{status:500});`;

// Parsings and constants
export const PARSE_PATH = `let ${C_URL}=${REQ}.url,${PATH_START}=${C_URL}.indexOf('/',12)+1,${PATH_END}=${C_URL}.indexOf('?',${PATH_START}),${PATH}=${PATH_END}===-1?${C_URL}.slice(${PATH_START}):${C_URL}.substring(${PATH_START},${PATH_END});`;
