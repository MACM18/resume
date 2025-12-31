import { createRequire } from "module";
const require = createRequire(import.meta.url);

// Delegate to the canonical CommonJS config so the CLI always reads one file
export default require("./prisma.config.js");
