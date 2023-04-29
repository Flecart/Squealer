/* eslint-disable */
const path = require('path');

const { CracoAliasPlugin } = require('react-app-alias-ex/src');

module.exports = {
    webpack: {
        alias: {
            '@flux': path.resolve(__dirname, 'src/flux'),
        },
        devServer: (devServerConfig) => {
            devServerConfig.writeToDisk = true;
            return devServerConfig;
        },
    },
    plugins: [
        {
            plugin: CracoAliasPlugin,
            options: {},
        },
    ],
};
