import { aotfn } from "@mapl/app/index.js";
import app from "../../app/main.js";
import { format } from 'prettier';

Bun.write(`${import.meta.dir}/fetch.js`, await format(`export default ${aotfn(app)};`, { parser: 'babel' }));
