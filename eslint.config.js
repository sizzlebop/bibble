// ESLint v9 flat config for TypeScript + Prettier
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";
import { defineConfig } from "eslint-define-config";

export default defineConfig([
    // Ignore non-source folders and generated files
    {
        ignores: [
            "dist/**",
            "bin/**",
            "assets/**",
            "backups/**",
            "demo/**",
            "ROADMAPS_AND_DEV/**",
                "test/**",
                "**/*.js",
                "**/*.cjs",
                "**/*.mjs",
        ],
    },
    // TypeScript recommended rules
    ...tseslint.configs.recommended,
    // Project-aware parser options for src TS files
    {
        files: ["src/**/*.ts"],
        languageOptions: {
            parserOptions: {
                project: "./tsconfig.json",
                tsconfigRootDir: import.meta.dirname,
                ecmaVersion: "latest",
                sourceType: "module",
            },
        },
    },
    // Turn off rules that conflict with Prettier, but don't run Prettier as a rule
    {
        files: ["src/**/*.ts"],
        ...prettier
    }
]);




