module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ["standard-with-typescript", "eslint:recommended"],
  overrides: [],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    curly: ["warn", "all"],
    "spaced-comment": ["warn", "always", { block: { balanced: true } }],
    "array-bracket-spacing": ["warn", "never"],
    "brace-style": ["warn", "1tbs"],
    camelcase: ["warn", { properties: "always" }],
    semi: ["warn", "always"],
  },
};
