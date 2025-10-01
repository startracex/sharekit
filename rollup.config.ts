import oxc from "rollup-plugin-oxc";
import { globSync } from "node:fs";
import { defineConfig } from "rollup";

export default defineConfig({
  input: globSync("src/**/*.ts"),
  plugins: [oxc()],
  output: [
    {
      dir: "lib",
      format: "esm",
      preserveModules: true,
      sourcemap: true,
    },
    {
      dir: "lib/node",
      format: "cjs",
      preserveModules: true,
      sourcemap: true,
    },
  ],
});
