import { Request, Route, Get, Post, Body, Path, Security, UploadedFile, FormField } from '@tsoa/runtime';
import { SmmService } from './smmService';
import { getUserFromRequest, parseMessageCreationWithFile } from '@api/utils';
import { type IUser, type ISuccessMessage } from '@model/user';
// import { IQuotas } from '@model/quota';
import { MessageCreationRensponse } from '@model/message';
import logger from '@server/logger';
import { IQuotas } from '@model/quota';

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
}
