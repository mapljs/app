import type { BaseRouter } from "@mapl/app/index.js";
import type { Macro } from "@mapl/app/router/macro.js";

export default (min: number) => ({
  jitSource: `${import.meta.dir}/jit.js`,
  options: min
} as Macro<number, BaseRouter>);
