module.exports = {
    env: {
        browser: true,
        es2021: true,
    },
    extends: [
        '../.eslintrc.cjs',
        'plugin:react/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
    ],
    overrides: [],
    parserOptions: {
        parser: '@typescript-eslint/parser',
        ecmaVersion: 'latest',
        project: true,
        tsconfigRootDir: __dirname,
    },
    plugins: ['react'],
    rules: {
        'react/react-in-jsx-scope': 'off',
    },
};
