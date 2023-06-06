import { Post, SuccessResponse, Response, UploadedFile, Route, Controller } from '@tsoa/runtime';
import { HttpError } from '@model/error';
import { UploadService } from './uploadService';

import logger from '@server/logger';

const uploadLogger = logger.child({ label: 'upload' });

@Route('/upload')
export class UploadController extends Controller {
    @Post('')
    @Response<HttpError>(400, 'Bad Request')
    @SuccessResponse(200, 'Upload file')
    public async uploadFile(@UploadedFile() file: Express.Multer.File): Promise<any> {
        uploadLogger.info(`[uploadFile] with name '${file.originalname}'`);

        return await new UploadService().uploadFile(file);
    }

    // TODO: privatize the file (can´t public access the file): https://github.com/lukeautry/tsoa/issues/44
}
