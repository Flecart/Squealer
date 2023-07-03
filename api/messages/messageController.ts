import {
    DefaultPageSize,
    IMessage,
    IReactionType,
    MapPosition,
    MessageSortTypes,
    type MessageCreationRensponse,
    type ReactionResponse,
    IMessageWithPages,
    MessageCreationMultipleChannels,
    MessageCreation,
} from '@model/message';
import {
    Get,
    Body,
    Query,
    Post,
    Route,
    Request,
    Response,
    Path,
    Security,
    FormField,
    UploadedFile,
} from '@tsoa/runtime';
import { MessageService } from './messageService';
import { getUserFromRequest, parseMessageCreationWithFile, parseWithFile } from '@api/utils';
import { HttpError } from '@model/error';
import logger from '@server/logger';
import message from '@db/message';

const log = logger.child({ label: 'messageController' });

@Route('/message')
export class MessageController {
    @Post('')
    @Security('jwt')
    @Response<MessageCreationRensponse>(204, 'Message Created')
    @Response<HttpError>(400, 'Bad request')
    public async createMessage(
        @FormField() data: string,
        @Request() request: any,
        @UploadedFile('file') file?: Express.Multer.File,
    ): Promise<MessageCreationRensponse> {
        return await new MessageService().create(parseMessageCreationWithFile(data, file), getUserFromRequest(request));
    }

    @Post('multiple')
    @Security('jwt')
    @Response<MessageCreationRensponse>(204, 'Message Created')
    @Response<HttpError>(400, 'Bad request')
    public async createMessages(
        @FormField() data: string,
        @Request() request: any,
        @UploadedFile('file') file?: Express.Multer.File,
    ): Promise<MessageCreationRensponse[]> {
        const messages = parseWithFile<MessageCreationMultipleChannels>(data, file);
        if (messages.parent != undefined) {
            // nel caso sia un messaggio di reply, si comporta in modo simile a un post per messaggio singolo.
            return [
                await new MessageService().create(
                    parseMessageCreationWithFile(data, file),
                    getUserFromRequest(request),
                ),
            ];
        }

        return await new MessageService().createMultiple(
            messages.channels.map((channelName) => {
                return {
                    channel: channelName,
                    parent: messages.parent,
                    content: messages.content,
                } as MessageCreation;
            }),
            getUserFromRequest(request),
        );
    }

    @Post('/geo/{id}')
    @Security('jwt')
    @Response<MessageCreationRensponse>(200, 'Position updated')
    @Response<HttpError>(400, 'Bad request')
    public async updatePosition(
        @Path('id') id: string,
        @Request() request: any,
        @Body() position: MapPosition,
    ): Promise<MessageCreationRensponse> {
        return new MessageService().updatePosition(id, position, getUserFromRequest(request));
    }

    @Get('/')
    @Response<IMessage[]>(200, 'OK')
    public async readAll(@Query('ids') ids: string[]): Promise<IMessage[]> {
        return new MessageService().getMessages(ids);
    }

    @Get('/user/{username}')
    @Response<IMessage[]>(200, 'OK')
    public async userMessage(
        @Path('username') user: string,
        @Query('page') page: number,
        @Query('limit') limit?: number,
        @Query('sort') sort?: MessageSortTypes,
    ): Promise<IMessageWithPages> {
        log.info(`userMessage: user: ${user}, page: ${page}, limit: ${limit}, sort: ${sort}`);
        if (!limit) {
            limit = DefaultPageSize;
        }
        return new MessageService().getOwnedMessages(user, page, limit, sort);
    }

    @Get('/user/{username}/messageIds')
    @Response<IMessage[]>(200, 'OK')
    public async getMessageIds(
        @Path('username') user: string,
        @Query('sort') sort?: MessageSortTypes,
    ): Promise<string[]> {
        log.info(`userMessage: user: ${user},  sort: ${sort}`);
        return new MessageService().getUserMessagesId(user, sort);
    }

    @Get('/{id}/')
    @Response<IMessage>(200, 'OK')
    public async readThread(@Path('id') id: string): Promise<IMessage> {
        return new MessageService().getMessagesWithId(id);
    }

    @Post('/{id}/reaction')
    @Security('jwt')
    public async reactMessage(
        @Request() req: any,
        @Path('id') id: string,
        @Body() reaction: { type: IReactionType },
    ): Promise<ReactionResponse> {
        return new MessageService().reactMessage(id, reaction.type, getUserFromRequest(req));
    }
}
