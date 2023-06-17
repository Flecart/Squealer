import { Path, Body, Post, Request, Get, Route, Security } from '@tsoa/runtime';
import { ModdashService } from './moddashService';
import { getUserFromRequest } from '@api/utils';

@Route('/moddash')
export class ModdashController {
    @Get('/users')
    @Security('jwt')
    public async listUsers(@Request() request: any): Promise<any> {
        return new ModdashService().listUsers(getUserFromRequest(request));
    }
    @Post('/suspend/{username}')
    @Security('jwt')
    public async suspendUser(@Request() request: any, @Path() username: string, @Body() body: any): Promise<any> {
        return new ModdashService().suspendUser(getUserFromRequest(request), username, body.suspended);
    }
}
