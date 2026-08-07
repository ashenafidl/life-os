import { defineConfig } from "oxfmt";

export default defineConfig({
  ignorePatterns: ["src/components/ui/", "drizzle/"],
  printWidth: 80,
  singleQuote: false,
  sortImports: true,
  sortTailwindcss: true,
});
