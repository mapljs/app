import { router } from "@mapl/app/index.js";
import { mainMacro } from "./main.js";

export default router()
  .macro(mainMacro, 0.2)
  .get('/', () => 'Hi');
