import { router } from "@mapl/app/index.js";
import { main } from "./main.js";

export default router()
  .macro(main(0.2))
  .get('/', () => 'Hi');
