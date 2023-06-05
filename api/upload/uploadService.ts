import { CLIENT_UPLOAD_DIR, DEFAULT_UPLOAD_DIR } from '@config/api';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export class UploadService {
    public async uploadFile(file: Express.Multer.File): Promise<{ path: string }> {
        return this.uploadBytes(file.buffer, file.originalname);
    }

    public async uploadBytes(buffer: Buffer, name: string): Promise<{ path: string }> {
        // check if file exists
        if (fs.existsSync(path.join(DEFAULT_UPLOAD_DIR, name))) {
            name = await this._makeNameUnique(name);
        }

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
        return `${uuidv4()}_${name}`;
    }
}
