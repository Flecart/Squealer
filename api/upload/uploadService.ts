import { CLIENT_UPLOAD_DIR, DEFAULT_UPLOAD_DIR } from '@config/api';
import fs from 'fs';
import path from 'path';

export class UploadService {
    public async uploadFile(file: Express.Multer.File): Promise<{ path: string }> {
        const name = await this._makeNameUnique(file.originalname);
        return this.uploadBytes(file.buffer, name);
    }

    public async uploadBytes(buffer: Buffer, name: string): Promise<{ path: string }> {
        return new Promise((resolve, reject) => {
            fs.writeFile(path.join(DEFAULT_UPLOAD_DIR, name), buffer, (err) => {
                if (err) reject(err);
                resolve({
                    path: `${CLIENT_UPLOAD_DIR}/${name}`,
                });
            });
        });
    }

    private async _makeNameUnique(name: string): Promise<string> {
        return `${new Date().getTime()}_${name}`;
    }
}
