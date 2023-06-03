// jest.config.js
const { pathsToModuleNameMapper } = require('ts-jest');
// In the following statement, replace `./tsconfig` with the path to your `tsconfig` file
// which contains the path mapping (ie the `compilerOptions.paths` option):

const paths = {
    '@api/*': ['<rootDir>/api/*'],
    '@config/*': ['<rootDir>/config/*'],
    '@server/*': ['<rootDir>/server/*'],
    '@model/*': ['<rootDir>/model/*'],
    '@db/*': ['<rootDir>/db/*'],
};

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    rootDir: __dirname,
    moduleNameMapper: pathsToModuleNameMapper(paths),
    modulePathIgnorePatterns: ['<rootDir>/build/'],
};
