import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      /* 1️⃣ No unused variables */
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          vars: "all",
          args: "after-used",
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "no-unused-vars": "off",

      /* 2️⃣ Enforce type-only imports */
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports" },
      ],

      /* 3️⃣ Enforce type instead of interface */
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],

      /* 4️⃣ Disallow any */
      "@typescript-eslint/no-explicit-any": "error",

      /* 5️⃣ Type-aware async safety */
      "@typescript-eslint/no-floating-promises": "error",

      /* 6️⃣ Strict equality */
      eqeqeq: ["error", "always"],

      /* 7️⃣ Prefer const */
      "prefer-const": "error",

      /* 8️⃣ No shadowing */
      "@typescript-eslint/no-shadow": "error",
      "no-shadow": "off",

      /* 9️⃣ Max line length */
      "max-lines": ["error", { max: 180 }],
    },
  },

  globalIgnores([
    ".open-next/**",
    ".next/**",
    ".vercel/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "src/graphql/generated.ts",
    "src/shared/apollo/generated.ts",
    "public/pdf.min.mjs",
    "public/pdf.worker.min.mjs",
  ]),
]);

export default eslintConfig;
