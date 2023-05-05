import { Post, SuccessResponse, Response, UploadedFile, Route, Controller } from '@tsoa/runtime';
import { HttpError } from '@model/error';
import { UploadService } from './uploadService';

@Route('/upload')
export class UploadController extends Controller {
    @Post('')
    @Response<HttpError>(400, 'Bad Request')
    @SuccessResponse(200, 'Upload file')
    public async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<any> {
        console.info('UploadController.uploadFile: ', file);

        return await new UploadService().uploadFile(file);
    }
}
