import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node20",
  outDir: "dist",
  clean: true,
  banner: {
    js: `import { createRequire } from "node:module"; const require = createRequire(import.meta.url);`,
  },
  noExternal: [/@workspace/],
})
