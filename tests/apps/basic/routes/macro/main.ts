import type { Macro } from "@mapl/app/macro.js";
import type { MacroFunc } from "@mapl/app/macro.js";
import { RET_404 } from "@mapl/app/constants.js";

export const mainMacro = {
  loadSource: import.meta.path
} as Macro<number>;

export default ((num, ctx) => {
  ctx[0] += `if(Math.random()<${num})${RET_404}`
}) as MacroFunc<number>;
