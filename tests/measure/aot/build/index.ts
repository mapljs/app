import { aotfn } from "@mapl/app/index.js";
import app from "../../app/main.js";

Bun.write(`${import.meta.dir}/fetch.js`, `export default ${aotfn(app)};`);
