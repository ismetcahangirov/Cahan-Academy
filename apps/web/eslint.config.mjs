import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // any tipləri xəbərdarlıq kimi göstərilsin, xəta kimi yox
      "@typescript-eslint/no-explicit-any": "warn",
      // istifadə olunmamış dəyişənlər xəbərdarlıq kimi göstərilsin
      "@typescript-eslint/no-unused-vars": ["warn", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }],
      // JSX-də unescaped entities xəbərdarlıq kimi göstərilsin
      "react/no-unescaped-entities": "warn",
      // React hooks dependency uyarıları xəbərdarlıq kimi qalsın
      "react-hooks/exhaustive-deps": "warn",
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "playwright-report/**",
      "test-results/**",
      "coverage/**",
      ".turbo/**",
    ],
  },
];

export default eslintConfig;
