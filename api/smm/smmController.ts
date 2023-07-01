import {
    Request,
    Route,
    Get,
    Post,
    Body,
    Path,
    Security,
    UploadedFile,
    FormField,
    Query,
    Response,
} from '@tsoa/runtime';
import { SmmService } from './smmService';
import { getUserFromRequest, parseMessageCreationWithFile } from '@api/utils';
import { type IUser, type ISuccessMessage } from '@model/user';
import { HistoryPoint } from '@model/history';
import { MessageCreationRensponse } from '@model/message';
import logger from '@server/logger';
import { IQuotas } from '@model/quota';
import { HttpError } from '@model/error';

const smmLogger = logger.child({ module: 'SMM' });

@Route('/smm')
export class SmmController {
    @Get('/clients')
    @Security('jwt')
    public async getClients(@Request() request: any): Promise<IUser[]> {
        return new SmmService().getClients(getUserFromRequest(request));
    }

    @Post('/add-client/{user}')
    @Security('jwt')
    @Response<HttpError>(404, 'Not found')
    @Response<HttpError>(401, 'Unauthorized')
    public async addClient(@Request() request: any, @Path() user: string): Promise<ISuccessMessage> {
        return new SmmService().addClient(user, getUserFromRequest(request));
    }
    @Get('/clients/{user}')
    @Security('jwt')
    public async getClient(@Request() request: any, @Path() user: string): Promise<IUser> {
        return new SmmService().getClient(getUserFromRequest(request), user);
    }

    @Post('/buy-quota/{user}')
    @Security('jwt')
    @Response<HttpError>(404, 'Not found')
    public async buyQuota(
        @Request() request: any,
        @Path() user: string,
        @Body() body: IQuotas,
    ): Promise<ISuccessMessage> {
        smmLogger.info(`User ${getUserFromRequest(request)} is buying quota for ${user}`);
        return new SmmService().buyQuota(user, getUserFromRequest(request), body);
    }

    @Post('/message/{clientUsername}')
    @Security('jwt')
    @Response<HttpError>(404, 'Not found')
    public async sendMessage(
        @Request() request: any,
        @Path() clientUsername: string,
        @FormField() data: string,
        @UploadedFile('file') file?: Express.Multer.File,
    ): Promise<MessageCreationRensponse> {
        return new SmmService().sendMessage(
            getUserFromRequest(request),
            clientUsername,
            parseMessageCreationWithFile(data, file),
        );
    }

    @Get('/history/{user}')
    @Security('jwt')
    @Response<HttpError>(401, 'Unauthorized')
    @Response<HttpError>(404, 'Not found')
    public async getClientHistory(
        @Request() request: any,
        @Path() user: string,
        @Query('from') from?: string,
        @Query('to') to?: string,
    ): Promise<HistoryPoint[]> {
        smmLogger.info(
            `getting all history points from ${from} to ${to} for user '${user}' requested by ${getUserFromRequest(
                request,
            )}'`,
        );
        return new SmmService().getClientHistory(getUserFromRequest(request), user, from, to);
    }
}
