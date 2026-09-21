import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: {
        process: "readonly",
        console: "readonly",
      },
    },
  },
  {
    files: ["public/**/*.js"],
    languageOptions: {
      globals: {
        document: "readonly",
        fetch: "readonly",
        console: "readonly",
      },
    },
  },
  {
    files: ["test/**/*.js"],
    languageOptions: {
      globals: {
        fetch: "readonly",
      },
    },
  },
];
