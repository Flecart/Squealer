import fs from 'fs';
import { DEFAULT_UPLOAD_DIR } from '@config/api';
import logger from './logger';

const log = logger.child({ label: 'storage' });

export default async function initStorageDir(): Promise<void> {
    log.info(`Checking existence storage directory on ${DEFAULT_UPLOAD_DIR}`);
    return new Promise((resolve, reject) => {
        fs.stat(DEFAULT_UPLOAD_DIR, (err) => {
            if (err) {
                log.info(`Directory ${DEFAULT_UPLOAD_DIR} not found, rejecting...`);
                reject(err);
            }
            resolve();
        });
    });
}
