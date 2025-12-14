import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Django project files
    "venv/**",
    "node_modules/**",
    "**/*.py",
    "**/*.pyc",
    "staticfiles/**",
    "media/**",
    "db.sqlite3",
    "django_learning_project/**",
    "blog/**",
    "users/**",
    "api/**",
    "templates/**",
    "static/**",
  ]),
]);

export default eslintConfig;
