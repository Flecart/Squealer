// jest.config.js
const { pathsToModuleNameMapper } = require('ts-jest');
// In the following statement, replace `./tsconfig` with the path to your `tsconfig` file
// which contains the path mapping (ie the `compilerOptions.paths` option):

const paths = {
    '@api/*': ['api/*'],
    '@config/*': ['config/*'],
    '@server/*': ['server/*'],
    '@model/*': ['model/*'],
    '@db/*': ['db/*'],
};

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    rootDir: __dirname,
    moduleNameMapper: pathsToModuleNameMapper(paths),
};
