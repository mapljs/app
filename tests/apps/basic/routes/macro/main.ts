import type { Macro } from "@mapl/app/macro.js";
import { RET_404 } from "@mapl/app/constants.js";

export const main = (options: number) => ({
  loadSource: (num, ctx) => {
    ctx[0] += `if(Math.random()<${num})${RET_404}`
  }, options
} as Macro<number>);
