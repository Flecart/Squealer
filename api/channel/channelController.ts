import { Query, Body, Post, Route, Get, Response, SuccessResponse, Controller } from '@tsoa/runtime';
import { ChannelService } from './channelService';
import { HttpError } from '@model/error';
import { Path, Put, Security, Request } from '@tsoa/runtime';
import { getMaybeUserFromRequest, getUserFromRequest } from '@api/utils';
import {
    IChannel,
    ChannelInfo,
    ChannelDescription,
    ChannelResponse,
    PermissionType,
    defaultSuggestionLimit,
    ISuggestion,
} from '@model/channel';
import { type ISuccessMessage } from '@model/user';
import logger from '@server/logger';
import { MessageSortTypes } from '@model/message';

const channelLogger = logger.child({ label: 'channel' });

@Route('/channel/')
export class ChannelController extends Controller {
    @Get('channels')
    @Security('jwt')
    @Response<HttpError>(400, 'Bad Request')
    @SuccessResponse(200)
    public async getChannels(@Request() request: any, @Query('channels') channels: string[]): Promise<IChannel[]> {
        return new ChannelService().getChannels(channels, getUserFromRequest(request));
    }

    @Get('suggestions')
    @SuccessResponse(200, 'Channel suggestions')
    @Response<HttpError>(400, 'Bad Request')
    public async getChannelSuggestions(
        @Query('search') search: string,
        @Query('avoid') avoid: string[],
        @Query('user') user: string,
        @Query('limit') limit?: number,
    ): Promise<ISuggestion[]> {
        if (!limit) limit = defaultSuggestionLimit;
        channelLogger.info(`Getting channel suggestions for ${search} avoiding ${avoid} with limit ${limit}`);
        return new ChannelService().getChannelSuggestions(search, avoid, limit, user);
    }

    @Get('suggestions/hashtag')
    @Response<HttpError>(400, 'Bad Request')
    @SuccessResponse(200, 'Channel suggestions')
    public async getChannelPublicSuggestions(
        @Query('search') search: string,
        @Query('avoid') avoid: string[],
        @Query('limit') limit?: number,
    ): Promise<ISuggestion[]> {
        if (!limit) limit = defaultSuggestionLimit;
        channelLogger.info(`Getting public channel suggestions for ${search} avoiding ${avoid} with limit ${limit}`);
        return new ChannelService().getPublicChannelSuggestions(search, avoid, limit);
    }

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
        channelLogger.info(`User ${getUserFromRequest(request)} create channel ${channelInfo.channelName}`);
        return {
            message: 'Channel created',
            channel: (
                await new ChannelService().create(
                    channelInfo.channelName,
                    getUserFromRequest(request),
                    channelInfo.type,
                    channelInfo.description as string,
                    true,
                )
            ).name,
        };
    }

    @Put('{channelName}/description')
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

    @Get('{channelName}/messagesId')
    @Security('maybeJWT')
    @Response<HttpError>(400, 'Bad Request')
    @SuccessResponse(200)
    public async getMessageIds(
        @Path('channelName') channelName: string,
        @Request() request: any,
        @Query('sort') sort?: MessageSortTypes,
    ): Promise<string[]> {
        return new ChannelService().getMessageIds(channelName, getMaybeUserFromRequest(request), sort);
    }

    @Post('{channelName}/join')
    @Security('jwt')
    @Response<HttpError>(400, 'Bad Request')
    @SuccessResponse(200, 'Channel joined')
    public async joinChannel(
        @Path('channelName') channelName: string,
        @Request() request: any,
    ): Promise<ChannelResponse> {
        channelLogger.info(`User ${getUserFromRequest(request)} joining channel ${channelName}`);
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
    public async decline(@Request() request: any, @Body() body: { messageID: string }): Promise<ISuccessMessage> {
        channelLogger.info(`User ${getUserFromRequest(request)} declining invite ${body.messageID}`);
        await new ChannelService().deleteInviteMessage(getUserFromRequest(request), body.messageID);
        return { message: 'declined' };
    }

    @Post('accept')
    @Security('jwt')
    @Response<HttpError>(400, 'Bad Request')
    @SuccessResponse(200, 'Channel joined')
    public async acceptInvite(@Body() body: { messageID: string }, @Request() request: any): Promise<ChannelResponse> {
        channelLogger.info(`User ${getUserFromRequest(request)} accepting invite ${body.messageID}`);
        const content = await new ChannelService().deleteInviteMessage(getUserFromRequest(request), body.messageID);
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

    @Post('{channelName}/set-permission')
    @Security('jwt')
    @Response<HttpError>(400, 'Bad Request')
    @SuccessResponse(200, 'Channel owner added')
    public async changePermission(
        @Path('channelName') channelName: string,
        @Body() body: { toUser: string; permission: PermissionType },
        @Request() request: any,
    ): Promise<PermissionType> {
        channelLogger.info(
            `User ${getUserFromRequest(request)} changing permission for ${body.toUser} to ${
                body.permission
            } in channel ${channelName}`,
        );
        return await new ChannelService().setPermission(
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
    ): Promise<ISuccessMessage> {
        channelLogger.info(`User ${getUserFromRequest(request)} adding owner ${body.toUser} to channel ${channelName}`);
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
