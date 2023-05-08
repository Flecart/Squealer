import fs from 'fs';
import { DEFAULT_UPLOAD_DIR } from '@config/api';

export default async function initStorageDir(): Promise<void> {
    return new Promise((resolve, reject) => {
        fs.mkdir(DEFAULT_UPLOAD_DIR, { recursive: true }, (err) => {
            if (err) {
                reject(err);
            }
            console.log(`Storage directory ${DEFAULT_UPLOAD_DIR} created`);
            resolve();
        });
    });
}
