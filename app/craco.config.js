const path = require('path');
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
};
