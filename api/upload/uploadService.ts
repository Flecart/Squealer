import { FileService } from '@api/file/fileService';

export class UploadService {
    public async uploadFile(file: Express.Multer.File): Promise<{ path: string }> {
        const { fileId } = await new FileService().uploadFile(file);
        return { path: `api/file/download/${fileId}` };
    }
}
