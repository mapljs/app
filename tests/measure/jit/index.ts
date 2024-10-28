import { jitc } from "@mapl/app/index.js";
import app from "../app/main.js";
import measure from "../measure.js";

measure('Compile time', () => jitc(app));
