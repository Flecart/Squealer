import { Delete, Path, Body, Post, Request, Get, Route, Security } from '@tsoa/runtime';
import { FilterPosts, ModdashService, ReactionRequest } from './moddashService';
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
    @Post('/posts')
    @Security('jwt')
    public async listPosts(@Request() request: any, @Body() body: FilterPosts): Promise<any> {
        moddashLog.info(
            `Listing posts requested by ${getUserFromRequest(request)} with filter ${JSON.stringify(body)}`,
        );
        return new ModdashService().listPosts(getUserFromRequest(request), body);
    }

    @Post('/post/{id}/reaction')
    @Security('jwt')
    public async changeRecation(
        @Request() request: any,
        @Path() id: string,
        @Body() body: ReactionRequest,
    ): Promise<any> {
        moddashLog.info(`Changing reaction to post ${id} requested by ${getUserFromRequest(request)}`);
        return new ModdashService().changeReaction(getUserFromRequest(request), id, body);
    }

    @Delete('/post/{id}')
    @Security('jwt')
    public async deletePost(@Request() request: any, @Path() id: string): Promise<any> {
        moddashLog.info(`Deleting post ${id} requested by ${getUserFromRequest(request)}`);
        return new ModdashService().deletePost(getUserFromRequest(request), id);
    }

    @Post('/post/{id}/copy')
    @Security('jwt')
    public async copyMessage(@Request() request: any, @Path() id: string, @Body() body: any): Promise<any> {
        moddashLog.info(`Copying post ${id} requested by ${getUserFromRequest(request)}`);
        return new ModdashService().copyMessage(getUserFromRequest(request), id, body.channel);
    }
}
