import fs from 'fs';
import { DEFAULT_UPLOAD_DIR } from '@config/api';
import logger from './logger';

const log = logger.child({ label: 'storage' });

export default async function initStorageDir(): Promise<void> {
    log.info(`Initializing storage directory on ${DEFAULT_UPLOAD_DIR}`);
    return new Promise((resolve, reject) => {
        fs.mkdir(DEFAULT_UPLOAD_DIR, { recursive: true }, (err) => {
            if (err) {
                reject(err);
            }
            resolve();
        });
    });
}
