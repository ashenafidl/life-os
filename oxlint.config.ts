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
    "eslint/no-unused-vars": "warn",
    "react/no-array-index-key": "error",
    "react/no-children-prop": "off",
    "no-console": "warn",
    "jsx-a11y/alt-text": "error",
  },
  ignorePatterns: ["src/components/ui/"],
});
