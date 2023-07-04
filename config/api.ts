import { IQuotas } from '@model/quota';

export const DEFAULT_QUOTA: IQuotas = {
    day: 2000,
    week: 2000000,
    month: 20000000,
};

const rootDir = require('path').resolve('./');
export const CLIENT_UPLOAD_DIR = `uploads`; // utilizzato per accedere al file dal client
export const DEFAULT_UPLOAD_DIR = `${rootDir}/build/app/${CLIENT_UPLOAD_DIR}/`;

// access hosted images
export const FILE_BASE = process.env['NODE_ENV'] === 'development' ? 'http://localhost:8000' : '';
