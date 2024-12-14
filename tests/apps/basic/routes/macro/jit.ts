import type { MacroFunc } from "@mapl/app/router/macro.js";
import { RET_404 } from "@mapl/app/constants.js";

export default ((min: number, ctx) => {
  ctx[0] += `if(Math.random() * 10<${min})${RET_404}`;
}) as MacroFunc;
