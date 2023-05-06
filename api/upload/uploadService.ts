import { CLIENT_UPLOAD_DIR, DEFAULT_UPLOAD_DIR } from '@config/api';
import fs from 'fs';
import path from 'path';

export class UploadService {
    public async uploadFile(file: Express.Multer.File): Promise<{ path: string }> {
        const name = await this.makeNameUnique(file.originalname);

        return new Promise((resolve, reject) => {
            fs.writeFile(path.join(DEFAULT_UPLOAD_DIR, name), file.buffer, (err) => {
                if (err) reject(err);
                resolve({ path: `${CLIENT_UPLOAD_DIR}/${name}` });
            });
        });
    }

    private async makeNameUnique(name: string): Promise<string> {
        return `${new Date().getTime()}_${name}`;
    }
}
