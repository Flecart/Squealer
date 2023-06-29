import { Post, SuccessResponse, Response, UploadedFile, Route, Controller, Get, Path } from '@tsoa/runtime';
import { HttpError } from '@model/error';
import { FileService } from './fileService';
import { Readable } from 'stream';

@Route('/file')
export class FileController extends Controller {
    @Get('/download/{fileId}')
    @Response<HttpError>(400, 'Bad Request')
    @SuccessResponse(200, 'Download file')
    public async downloadFile(@Path('fileId') fileId: string): Promise<any> {
        console.info(`FileController.downloadFile with id '${fileId}'`);

        const file = await new FileService().downloadFile(fileId);
        this.setHeader('Content-Type', file.mimetype);
        this.setHeader('Content-Disposition', `inline; filename="${file.name}"`);
        this.setHeader('Content-Length', file.size.toString());

        return Readable.from(file.buffer);
    }

    @Post('/upload')
    @Response<HttpError>(400, 'Bad Request')
    @SuccessResponse(200, 'Upload file')
    public async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<any> {
        console.info(`FileController.uploadFile with name '${file.originalname}'`);

        return await new FileService().uploadFile(file);
    }

    // TODO: privatize the file (can´t public access the file): https://github.com/lukeautry/tsoa/issues/44
}
