import { defineConfig } from "oxlint";

export default defineConfig({
  plugins: ["typescript", "unicorn", "oxc"],
  categories: {
    correctness: "error",
  },
  env: {
    builtin: true,
  },
  rules: {
    "eslint/no-unused-vars": "error",
  },
  ignorePatterns: ["src/components/ui/"],
});
