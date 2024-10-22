import { jitc } from "@mapl/app/index.js";
import app from "../app/main.js";

console.time('Compile time');
jitc(app);
console.timeEnd('Compile time');
