import { Body, Post, Route, Get, Response, SuccessResponse, Controller } from '@tsoa/runtime';
import { ChannelService } from './channelService';
import { HttpError } from '@model/error';
import { Path, Put, Security, Request } from '@tsoa/runtime';
import { getMaybeUserFromRequest, getUserFromRequest } from '@api/utils';
import { IChannel, ChannelInfo, ChannelDescription, ChannelResponse, PermissionType } from '@model/channel';

@Route('/channel/')
export class ChannelController extends Controller {
    @Get()
    @Response<HttpError>(400, 'Bad Request')
    @Security('maybeJWT')
    @SuccessResponse(200)
    public async list(@Request() request: any): Promise<IChannel[]> {
        return new ChannelService().list(getMaybeUserFromRequest(request));
    }

    @Post('create')
    @Security('jwt')
    @Response<HttpError>(400, 'Bad Request')
    @SuccessResponse(201, 'Channel created')
    public async create(@Body() channelInfo: ChannelInfo, @Request() request: any): Promise<ChannelResponse> {
        console.info('ChannelController.create: ', channelInfo, getUserFromRequest(request));
        return new ChannelService().create(
            channelInfo.channelName,
            getUserFromRequest(request),
            channelInfo.type,
            channelInfo.description as string,
            true,
        );
    }

    @Put('{channelName}/descrition')
    @Security('jwt')
    @Response<HttpError>(400, 'Bad Request')
    @SuccessResponse(200, 'Channel description updated')
    public async updateDescription(
        @Path('channelName') channelName: string,
        @Body() description: ChannelDescription,
        @Request() request: any,
    ): Promise<ChannelResponse> {
        return new ChannelService().updateDescription(
            channelName,
            description.description,
            getUserFromRequest(request),
        );
    }

    @Get('{channelName}/')
    @Security('maybeJWT')
    @Response<HttpError>(400, 'Bad Request')
    @SuccessResponse(200)
    public async GetChannel(@Path('channelName') channelName: string, @Request() request: any): Promise<IChannel> {
        return new ChannelService().getChannel(channelName, getMaybeUserFromRequest(request));
    }

    @Post('{channelName}/join')
    @Security('jwt')
    @Response<HttpError>(400, 'Bad Request')
    @SuccessResponse(200, 'Channel joined')
    public async joinChannel(
        @Path('channelName') channelName: string,
        @Request() request: any,
    ): Promise<ChannelResponse> {
        return new ChannelService().joinChannel(
            channelName,
            getUserFromRequest(request),
            PermissionType.READWRITE,
            true,
        );
    }
    @Post('decline')
    @Security('jwt')
    @Response<HttpError>(400, 'Bad Request')
    @SuccessResponse(200, 'Channel declined')
    public async decline(@Body() body: { messageID: string }): Promise<{ message: string }> {
        await new ChannelService().deleteInviteMessage(body.messageID);
        return { message: 'declined' };
    }
    @Post('accept')
    @Security('jwt')
    @Response<HttpError>(400, 'Bad Request')
    @SuccessResponse(200, 'Channel joined')
    public async acceptInvite(@Body() body: { messageID: string }, @Request() request: any): Promise<ChannelResponse> {
        console.log('acceptInvite', body);
        const content = await new ChannelService().deleteInviteMessage(body.messageID);
        if (content.to !== getUserFromRequest(request))
            throw new HttpError(403, 'You are not allowed to join this channel');
        console.log('acceptInvite', content);
        return new ChannelService().joinChannel(content.channel, content.to, content.permission, false);
    }

    @Post('{channelName}/notify')
    @Security('jwt')
    @Response<HttpError>(400, 'Bad Request')
    @SuccessResponse(200, 'Channel left')
    public async setNotification(
        @Path('channelName') channelName: string,
        @Body() body: { notify: boolean },
        @Request() request: any,
    ): Promise<ChannelResponse> {
        return new ChannelService().setNotify(channelName, body.notify, getUserFromRequest(request));
    }

    @Post('{channelName}/leave')
    @Security('jwt')
    @Response<HttpError>(400, 'Bad Request')
    @SuccessResponse(200, 'Channel left')
    public async leaveChannel(
        @Path('channelName') channelName: string,
        @Request() request: any,
    ): Promise<ChannelResponse> {
        return new ChannelService().leaveChannel(channelName, getUserFromRequest(request));
    }

    @Post('{channelName}/delete')
    @Security('jwt')
    @Response<HttpError>(400, 'Bad Request')
    @SuccessResponse(200, 'Channel deleted')
    public async deleteChannel(
        @Path('channelName') channelName: string,
        @Request() request: any,
    ): Promise<ChannelResponse> {
        return new ChannelService().deleteChannel(channelName, getUserFromRequest(request));
    }

    @Post('{channelName}/change-permission')
    @Security('jwt')
    @Response<HttpError>(400, 'Bad Request')
    @SuccessResponse(200, 'Channel owner added')
    public async changePermission(
        @Path('channelName') channelName: string,
        @Body() body: { toUser: string; permission: PermissionType },
        @Request() request: any,
    ): Promise<PermissionType> {
        return await new ChannelService().getPermission(
            getUserFromRequest(request),
            channelName,
            body.toUser,
            body.permission,
        );
    }

    @Post('{channelName}/add-owner')
    @Security('jwt')
    @Response<HttpError>(400, 'Bad Request')
    @SuccessResponse(200, 'Channel owner added')
    public async addOwner(
        @Path('channelName') channelName: string,
        @Body() body: { toUser: string; permission: PermissionType },
        @Request() request: any,
    ): Promise<{ message: string }> {
        return {
            message: await new ChannelService().addMember(
                channelName,
                body.toUser,
                getUserFromRequest(request),
                body.permission,
            ),
        };
    }
}
