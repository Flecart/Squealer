import { DEFAULT_UPLOAD_DIR } from '@config/api';
import fs from 'fs';
import path from 'path';

export class UploadService {
    public async uploadFile(file: Express.Multer.File): Promise<{ message: string }> {
        const name = await this.makeNameUnique(file.originalname);

        return new Promise((resolve, reject) => {
            fs.writeFile(path.join(DEFAULT_UPLOAD_DIR, name), file.buffer, (err) => {
                if (err) reject(err);
                resolve({ message: 'file saved successfully' });
            });
        });
    }

    private async makeNameUnique(name: string): Promise<string> {
        return `${new Date().getTime()}_${name}`;
    }
}
