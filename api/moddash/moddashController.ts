import { Controller, Request, Get, Route, Security } from 'tsoa';
import { ModdashService } from './moddashService';
import { getUserFromRequest } from '@api/utils';

@Route('/moddash')
export class ModdashController extends Controller {
    @Get('/')
    @Security('jwt')
    public async listUsers(@Request() request: any) {
        return new ModdashService().listUsers(getUserFromRequest(request));
    }
}
