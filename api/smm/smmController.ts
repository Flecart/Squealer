import {
    Request,
    Route,
    Delete,
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
import { getUserFromRequest, parseMessageCreationWithFile, parseWithFile } from '@api/utils';
import { type IUser, type ISuccessMessage } from '@model/user';
import { HistoryPoint } from '@model/history';
import { MessageCreationMultipleChannels, MessageCreationRensponse } from '@model/message';
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

    @Get('/my-request')
    @Security('jwt')
    @Response<HttpError>(404, 'Not found')
    @Response<HttpError>(401, 'Unauthorized')
    public async getMyRequest(@Request() request: any): Promise<ISuccessMessage> {
        smmLogger.info(`User ${getUserFromRequest(request)} is getting his request`);
        return new SmmService().getMyRequest(getUserFromRequest(request));
    }

    // this api is used by vip account
    @Post('/send-request/{user}')
    @Security('jwt')
    @Response<HttpError>(404, 'Not found')
    @Response<HttpError>(401, 'Unauthorized')
    public async sendRequest(@Request() request: any, @Path() user: string): Promise<ISuccessMessage> {
        smmLogger.info(`User ${getUserFromRequest(request)} is sending request to ${user}`);
        return new SmmService().sendRequest(getUserFromRequest(request), user);
    }

    // this api is used by vip account
    @Delete('/delete-request/')
    @Security('jwt')
    @Response<HttpError>(404, 'Not found')
    @Response<HttpError>(401, 'Unauthorized')
    public async deleteRequest(@Request() request: any): Promise<ISuccessMessage> {
        smmLogger.info(`User ${getUserFromRequest(request)} is deleting his request`);
        return new SmmService().deleteRequest(getUserFromRequest(request));
    }

    @Delete('/reject-request/{user}')
    @Security('jwt')
    @Response<HttpError>(404, 'Not found')
    @Response<HttpError>(401, 'Unauthorized')
    public async rejectRequest(@Request() request: any, @Path() user: string): Promise<ISuccessMessage> {
        smmLogger.info(`User ${getUserFromRequest(request)} is reject the request from ${user}`);
        return new SmmService().rejectRequest(getUserFromRequest(request), user);
    }

    @Get('/requests')
    @Security('jwt')
    public async getRequests(@Request() request: any): Promise<IUser[]> {
        return new SmmService().getRequests(getUserFromRequest(request));
    }

    @Post('/add-client/{user}')
    @Security('jwt')
    @Response<HttpError>(404, 'Not found')
    @Response<HttpError>(401, 'Unauthorized')
    public async addClient(@Request() request: any, @Path() user: string): Promise<ISuccessMessage> {
        smmLogger.info(`User ${getUserFromRequest(request)} is adding client ${user}`);
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

    @Post('/messages/{clientUsername}')
    @Security('jwt')
    @Response<HttpError>(404, 'Not found')
    public async sendMessages(
        @Request() request: any,
        @Path() clientUsername: string,
        @FormField() data: string,
        @UploadedFile('file') file?: Express.Multer.File,
    ): Promise<MessageCreationRensponse[]> {
        return new SmmService().sendMessages(
            getUserFromRequest(request),
            clientUsername,
            parseWithFile<MessageCreationMultipleChannels>(data, file),
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
