import { defineConfig } from "oxfmt";

export default defineConfig({
  ignorePatterns: ["src/components/ui/"],
  printWidth: 80,
  singleQuote: false,
  sortImports: true,
  sortTailwindcss: true,
});
