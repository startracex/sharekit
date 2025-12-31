import oxc from "rollup-plugin-oxc";
import { globSync } from "node:fs";
import { defineConfig } from "rollup";

export default defineConfig({
  input: globSync("src/**/*.ts"),
  plugins: [oxc({ minify: true })],
  output: [
    {
      dir: "lib",
      format: "esm",
      entryFileNames: "[name].js",
      preserveModules: true,
      sourcemap: true,
    },
    {
      dir: "lib",
      format: "cjs",
      entryFileNames: "[name].cjs",
      preserveModules: true,
      sourcemap: true,
    },
  ],
});
