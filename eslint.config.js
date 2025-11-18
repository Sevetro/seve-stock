import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { globalIgnores } from "eslint/config";
import react from "eslint-plugin-react";

export default tseslint.config([
  globalIgnores(["dist", "dist-electron", "dist-react", "data-cache"]),
  {
    files: ["**/*.{ts,tsx}"],
    ignores: ["src/ui/**/*.scss.d.ts"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs["recommended-latest"],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      react
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "off",
      semi: ["error", "always"],
      quotes: ["error", "single"],
      "react/jsx-tag-spacing": ["error", {
        "beforeClosing": "never"
      }],
      "react/jsx-first-prop-new-line": ["error", "multiline"],
      "react/jsx-max-props-per-line": ["error", { "maximum": 1, "when": "multiline" }],
      "react/jsx-closing-bracket-location": ["error", "tag-aligned"],
      "comma-dangle": ["error", "never"],
      "no-multiple-empty-lines": ["error", { "max": 1, "maxBOF": 0, "maxEOF": 0 }],
      "eol-last": ["error", "never"] //WARN: this may cause issues
    },
  },
]);