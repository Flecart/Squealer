import { IQuotas } from '@model/quota';

export const DEFAULT_QUOTA: IQuotas = {
    day: 200,
    month: 1000,
    week: 20000,
};

const rootDir = require('path').resolve('./');
export const CLIENT_UPLOAD_DIR = `uploads/`; // utilizzato per accedere al file dal client
export const DEFAULT_UPLOAD_DIR = `${rootDir}/build/app/${CLIENT_UPLOAD_DIR}`;
