import { Request, Route, Get, Post, Body, Path, Security, UploadedFile, FormField } from '@tsoa/runtime';
import { SmmService } from './smmService';
import { getUserFromRequest, parseMessageCreationWithFile } from '@api/utils';
import { IUser } from '@model/user';
import { IQuotas } from '@model/quota';

export type SmmBuyQuotaInput = {
    clientUsername: string;
    dayAmount: number;
    weekAmount: number;
    monthAmount: number;
};

@Route('/smm')
export class SmmController {
    @Get('/clients')
    @Security('jwt')
    // TODO: set success and failure response, non credo sia la cosa più giusta ritornare il singolo utente
    // si potrebbe decidere di tenere solo Nome, username, profile pic?? Non lo so ancora...
    public async getClients(@Request() request: any): Promise<IUser[]> {
        return new SmmService().getClients(getUserFromRequest(request));
    }

    @Post('/add-client/{smmusername}')
    @Security('jwt')
    // TODO: set success and failure response move any to different value
    public async addClient(@Request() request: any, @Path() smmusername: string): Promise<any> {
        return new SmmService().addClient(getUserFromRequest(request), smmusername);
    }

    @Post('/buy-quota/')
    @Security('jwt')
    // TODO: set success and failure response, move any to different value
    public async buyQuota(@Request() request: any, @Body() body: SmmBuyQuotaInput): Promise<any> {
        return new SmmService().buyQuota(body, getUserFromRequest(request));
    }

    @Get('/quota/{clientUsername}')
    @Security('jwt')
    // TODO: set success and failure response
    public async getQuota(@Request() request: any, @Path() clientUsername: string): Promise<IQuotas> {
        return new SmmService().getQuota(getUserFromRequest(request), clientUsername);
    }

    @Get('/max-quota/{clientUsername}')
    @Security('jwt')
    // TODO: set success and failure response
    public async getMaxQuota(@Request() request: any, @Path() clientUsername: string): Promise<IQuotas> {
        return new SmmService().getMaxQuota(getUserFromRequest(request), clientUsername);
    }

    @Post('/message/{clientUsername}')
    @Security('jwt')
    // TODO: set success and failure response
    public async sendMessage(
        @Request() request: any,
        @Path() clientUsername: string,
        @FormField() data: string,
        @UploadedFile('file') file?: Express.Multer.File,
    ): Promise<any> {
        return new SmmService().sendMessage(
            getUserFromRequest(request),
            clientUsername,
            parseMessageCreationWithFile(data, file),
        );
    }
}
