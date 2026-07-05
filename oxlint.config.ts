import { defineConfig } from "oxlint";

export default defineConfig({
  plugins: ["typescript", "unicorn", "oxc", "react"],
  categories: {
    correctness: "error",
  },
  env: {
    builtin: true,
  },
  rules: {
    "eslint/no-unused-vars": "error",
    "react/no-array-index-key": "error",
    "react/no-children-prop": "off",
  },
  ignorePatterns: ["src/components/ui/"],
});
