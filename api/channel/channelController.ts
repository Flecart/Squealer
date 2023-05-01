import { Body, Post, Route, Response, SuccessResponse, Controller } from '@tsoa/runtime';
import { ChannelService } from './channelService';
import { HttpError } from '@model/error';
import { Path, Put, Security, Request } from '@tsoa/runtime';
import { getUserFromRequest } from '@api/utils';

export interface ChannelInfo {
    channelName: string;
    description?: string;
}

export interface ChannelDescription {
    description: string;
}

export interface ChannelResponse {
    message: string;
}

@Route('/channel/')
export class ChannelController extends Controller {
    @Post('create')
    @Security('jwt')
    @Response<HttpError>(400, 'Bad Request')
    @SuccessResponse(201, 'Channel created')
    public async login(@Body() channelInfo: ChannelInfo, @Request() request: any): Promise<ChannelResponse> {
        return new ChannelService().create(
            channelInfo.channelName,
            getUserFromRequest(request),
            channelInfo.description as string,
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

    @Post('{channelName}/join')
    @Security('jwt')
    @Response<HttpError>(400, 'Bad Request')
    @SuccessResponse(200, 'Channel joined')
    public async joinChannel(
        @Path('channelName') channelName: string,
        @Request() request: any,
    ): Promise<ChannelResponse> {
        return new ChannelService().joinChannel(channelName, getUserFromRequest(request));
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

    @Post('{channelName}/add-owner')
    @Security('jwt')
    @Response<HttpError>(400, 'Bad Request')
    @SuccessResponse(200, 'Channel owner added')
    public async addOwner(
        @Path('channelName') channelName: string,
        @Body() owner: string,
        @Request() request: any,
    ): Promise<ChannelResponse> {
        return new ChannelService().addOwner(channelName, owner, getUserFromRequest(request));
    }
}
