import { HttpError } from '@model/error';
import { IFile } from '@model/file';
import FileModel from '@db/file';

export class FileService {
    public async downloadFile(fileId: string): Promise<IFile> {
        const file = await FileModel.findById(fileId);

        if (!file) {
            throw new HttpError(404, `File with id '${fileId}' not found`);
        }

        return file;
    }

    public async uploadFile(file: Express.Multer.File): Promise<{ fileId: string }> {
        const fileModel = new FileModel({
            name: file.originalname,
            size: file.size,
            mimetype: file.mimetype,
            buffer: file.buffer,
        });

        await fileModel.save();

        return { fileId: fileModel._id.toString() };
    }
}
