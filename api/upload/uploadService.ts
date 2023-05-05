// import multer from 'multer';
// import { DEFAULT_UPLOAD_DIR } from '@config/api';

// const multerUpload = multer({
//     dest: DEFAULT_UPLOAD_DIR
// })

export class UploadService {
    public async uploadFile(file: Express.Multer.File): Promise<{ message: string }> {
        console.log(file);
        return { message: 'todo' };
    }
}
