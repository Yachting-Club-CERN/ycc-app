import css from "@eslint/css";
import js from "@eslint/js";
import json from "@eslint/json";
import markdown from "@eslint/markdown";
import type { Linter } from "eslint";
import { defineConfig, globalIgnores } from "eslint/config";
import importPlugin from "eslint-plugin-import";
import prettier from "eslint-plugin-prettier/recommended";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import unusedImports from "eslint-plugin-unused-imports";
import tseslint from "typescript-eslint";

const JS_AND_TS_FILES = "**/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx}";
const TS_FILES = "**/*.{ts,mts,cts,tsx}";

const importRules: Linter.RulesRecord = {
  "import/first": "error",
  "import/newline-after-import": "error",
  "import/no-absolute-path": "error",
  "import/no-anonymous-default-export": "warn", // Sometimes useful
  "import/no-cycle": "error", // Useful, but can become expensive (if it does, consider using maxDepth)
  "import/no-extraneous-dependencies": [
    "error",
    {
      devDependencies: [
        "e2e/**",
        "eslint.config.mts",
        "playwright.config.ts",
        "tests/**",
        "vite.config.ts",
        "vitest.config.mts",
      ],
      peerDependencies: true,
    },
  ],
  "import/no-mutable-exports": "error",

  // import/no-relative-parent-imports did not work well for sibling packages as @/* resolved to relative paths (2025-11)
  // Added no-restricted-imports instead
  "import/no-relative-parent-imports": "off",
  "no-restricted-imports": [
    "error",
    {
      patterns: [
        {
          group: ["../*", ".."],
          message:
            "Relative parent imports are not allowed. Please use absolute imports (aliases) instead.",
        },
        // https://mui.com/material-ui/guides/minimizing-bundle-size/#enforce-best-practices-with-eslint
        {
          regex: "^@mui/(material|icons-material)$",
          message:
            "Use path imports (e.g., @mui/material/Button) for better dev performance.",
        },
      ],
    },
  ],
  "import/no-self-import": "error",
  "import/no-useless-path-segments": "error",
  // Import ordering with alphabetical sorting
  "import/order": [
    "error",
    {
      groups: [
        "builtin",
        "external",
        "unknown",
        "internal",
        ["parent", "sibling", "index"],
        "object",
      ],
      pathGroups: [
        {
          pattern: "@/**",
          group: "internal",
          position: "after",
        },
      ],
      pathGroupsExcludedImportTypes: ["builtin"],
      "newlines-between": "always",
      alphabetize: {
        order: "asc",
        orderImportKind: "asc",
        caseInsensitive: true,
      },
    },
  ],
} as const;

const unusedImportsRules: Linter.RulesRecord = {
  // Disable base no-unused-vars and use unused-imports plugin instead
  "@typescript-eslint/no-unused-vars": "off",
  "unused-imports/no-unused-imports": "error",
  "unused-imports/no-unused-vars": [
    "warn",
    {
      vars: "all",
      varsIgnorePattern: "^_",
    },
  ],
} as const;

const sortImportsRule: Linter.RulesRecord = {
  // Sort members inside { } - import/order handles statement sorting
  "sort-imports": [
    "error",
    {
      ignoreCase: true,
      ignoreDeclarationSort: true, // Let import/order handle statement sorting
      ignoreMemberSort: false, // Sort members inside { }
    },
  ],
} as const;

const typescriptRules: Linter.RulesRecord = {
  "@typescript-eslint/explicit-function-return-type": "error",
  "@typescript-eslint/explicit-member-accessibility": "error",
  "@typescript-eslint/explicit-module-boundary-types": "error",
  "@typescript-eslint/no-floating-promises": "error",
  "@typescript-eslint/no-misused-promises": [
    "error",
    { checksVoidReturn: false },
  ],
  "@typescript-eslint/restrict-template-expressions": "off",
} as const;

const jsRules: Linter.RulesRecord = {
  ...importRules,
  ...sortImportsRule,
  ...unusedImportsRules,
} as const;

const tsRules: Linter.RulesRecord = {
  ...jsRules,
  ...typescriptRules,
} as const;

const eslintConfig = defineConfig([
  globalIgnores([
    "coverage/**",
    "dev-dist/**",
    "dist/**",
    "playwright-report/**",
    "test-results/**",
  ]),

  // Base JavaScript recommended rules (only for JS/TS files)
  {
    name: "base/js-recommended",
    files: [JS_AND_TS_FILES],
    ...js.configs.recommended,
  },

  // TypeScript recommended rules
  tseslint.configs.recommended,

  // Import plugin recommended rules (no-unresolved, named, default, export, no-duplicates, etc.)
  {
    name: "base/import-recommended",
    files: [JS_AND_TS_FILES],
    ...importPlugin.flatConfigs.recommended,
  },
  {
    name: "base/import-typescript",
    files: [TS_FILES],
    ...importPlugin.flatConfigs.typescript,
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
        },
      },
    },
  },

  // Config files - no type-aware linting (they're outside tsconfig rootDir)
  {
    name: "base/eslint-config-files",
    files: ["**/eslint.config.mts", "**/vitest.config.mts"],
    plugins: {
      "unused-imports": unusedImports,
    },
    languageOptions: {
      parser: tseslint.parser,
    },
    rules: {
      ...jsRules,
      "import/no-extraneous-dependencies": "off",
      // Disable import resolution for config files (workspace packages and eslint/config not resolved)
      "import/no-unresolved": "off",
    },
  },

  // Strict TypeScript rules and import ordering matching project conventions
  {
    name: "base/typescript-strict",
    files: [TS_FILES],
    plugins: {
      "unused-imports": unusedImports,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        // projectService does not work well when tsconfig* files do fine-grained control as of 2025-11
        // https://typescript-eslint.io/troubleshooting/typed-linting/#i-get-errors-telling-me--was-not-found-by-the-project-service-consider-either-including-it-in-the-tsconfigjson-or-including-it-in-allowdefaultproject
        // "If not, you can switch to parserOptions.project for more fine-grained control of projects."
        project: [
          "./tsconfig.json",
          "./e2e/tsconfig.json",
          "./tests/tsconfig.json",
        ],
      },
    },
    rules: tsRules,
  },

  // React
  {
    name: "base/react",
    files: [JS_AND_TS_FILES],
    plugins: {
      react,
      // @ts-expect-error https://github.com/typescript-eslint/typescript-eslint/issues/11543
      "react-hooks": reactHooks,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },

  // Relaxed rules for Playwright E2E tests (not React code)
  {
    name: "e2e/relaxed",
    files: ["e2e/**"],
    rules: {
      "react-hooks/rules-of-hooks": "off",
    },
  },

  // JSON files
  {
    name: "base/json",
    files: ["**/*.json"],
    ignores: ["**/tsconfig.json", "**/tsconfig.*.json"],
    // @ts-expect-error https://github.com/eslint/json/issues/207
    plugins: { json },
    language: "json/json",
    extends: ["json/recommended"],
  },

  // JSONC files
  {
    name: "base/jsonc",
    files: ["**/*.jsonc"],
    // @ts-expect-error https://github.com/eslint/json/issues/207
    plugins: { json },
    language: "json/jsonc",
    languageOptions: {
      allowTrailingCommas: true,
    },
    extends: ["json/recommended"],
  },

  // JSON5 files
  {
    name: "base/json5",
    files: ["**/*.json5"],
    // @ts-expect-error https://github.com/eslint/json/issues/207
    plugins: { json },
    language: "json/json5",
    extends: ["json/recommended"],
  },

  // CSS files
  {
    name: "base/css",
    files: ["**/*.css"],
    // @ts-expect-error https://github.com/eslint/css/issues — same root cause as eslint/json#207
    plugins: { css },
    language: "css/css",
    extends: ["css/recommended"],
  },

  // Markdown files
  {
    name: "base/markdown",
    files: ["**/*.md"],
    plugins: { markdown },
    language: "markdown/gfm",
    extends: ["markdown/recommended"],
  },

  // Prettier integration (must be near the end)
  prettier,

  // Disable Prettier for Markdown
  {
    name: "base/markdown-prettier-off",
    files: ["**/*.md"],
    rules: {
      "prettier/prettier": "off",
    },
  },
]);

export default eslintConfig;
