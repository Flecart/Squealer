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
    curly: ["error", "all"],
    "spaced-comment": ["error", "always", { block: { balanced: true } }],
    "array-bracket-spacing": ["error", "never"],
    "brace-style": ["error", "1tbs"],
    "comma-dangle": ["error", "only-multiline"],
    camelcase: ["error", { properties: "always" }],
    semi: ["error", "always"],
    quotes: ["error", "double"],
    indent: ["error", 4],
    "quote-props": ["error", "consistent"],
  },
};
