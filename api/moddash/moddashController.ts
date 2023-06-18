import { Path, Body, Post, Request, Get, Route, Security } from '@tsoa/runtime';
import { ModdashService } from './moddashService';
import { getUserFromRequest } from '@api/utils';
import logger from '@server/logger';

const moddashLog = logger.child({ label: 'moddash' });

@Route('/moddash')
export class ModdashController {
    @Get('/users')
    @Security('jwt')
    public async listUsers(@Request() request: any): Promise<any> {
        moddashLog.info(`Listing users requested by ${getUserFromRequest(request)}`);
        return new ModdashService().listUsers(getUserFromRequest(request));
    }
    @Post('/suspend/{username}')
    @Security('jwt')
    public async suspendUser(@Request() request: any, @Path() username: string, @Body() body: any): Promise<any> {
        moddashLog.info(
            `Set suspended:${body.suspended} to user ${username} requested by ${getUserFromRequest(request)}`,
        );
        return new ModdashService().suspendUser(getUserFromRequest(request), username, body.suspended);
    }
    @Post('/changeQuota/{username}')
    @Security('jwt')
    public async changeQuota(@Request() request: any, @Path() username: string, @Body() body: any): Promise<any> {
        moddashLog.info(`Set quota:${body.quota} to user ${username} requested by ${getUserFromRequest(request)}`);
        return new ModdashService().changeQuota(getUserFromRequest(request), username, body.quota);
    }
}
