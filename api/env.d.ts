// Minimal ambient declaration for the Node.js globals this directory uses.
// Declared locally rather than pulling in @types/node: the endpoint touches
// only `process.env` and `console`, and both are guaranteed by the Vercel
// Node.js runtime.
declare const process: { env: Record<string, string | undefined> };
