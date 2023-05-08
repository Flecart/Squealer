import { Get, Body, Query, Post, Route, Request, Response, Path, Security, FormField } from '@tsoa/runtime';
import { IMessage, MessageCreation } from '@model/message';
import { MessageService } from './messageService';
import { getUserFromRequest } from '@api/utils';
import { type MessageCreationRensponse } from '../../model/message';

/*
    MessageCreation is a type that is used to create a message.
    it has three fields: destination, creator and content.
*/

@Route('/message')
export class MessageController {
    @Post('')
    @Security('jwt')
    @Response<IMessage>(204, 'Message Created')
    @Response<Error>(400, 'Bad request')
    public async createMessage(
        @Body() bodyData: MessageCreation,
        @Request() request: any,
    ): Promise<MessageCreationRensponse> {
        console.info('MessageController.createMessage: ', bodyData, getUserFromRequest(request));
        return await new MessageService().create(bodyData, getUserFromRequest(request));
    }

    @Post('/new')
    @Security('jwt')
    @Response<IMessage>(204, 'Message Created')
    @Response<Error>(400, 'Bad request')
    public async createMessageNew(
        @FormField() channel: string,
        @FormField() parent: string,
        @Body() bodyData: MessageCreation,
        @Request() request: any,
    ): Promise<MessageCreationRensponse> {
        console.info('MessageController.createMessageNew: ', bodyData, getUserFromRequest(request));
        return await new MessageService().create(bodyData, getUserFromRequest(request));
    }

    @Get('/')
    @Response<IMessage[]>(200, 'OK')
    public async readAll(@Query('ids') ids: string[]): Promise<IMessage[]> {
        return new MessageService().getMessages(ids);
    }

    @Get('/user/{username}')
    @Response<IMessage[]>(200, 'OK')
    public async userMessage(@Path('username') user: string): Promise<IMessage[]> {
        return new MessageService().getOwnedMessages(user);
    }

    @Get('/{id}/')
    @Response<IMessage>(200, 'OK')
    public async readThread(@Path('id') id: string): Promise<IMessage> {
        return new MessageService().getMessagesWithId(id);
    }

    @Post('/batch-view')
    public async batchView(@Body() _messageIds: string[]) {
        // TODO: return new MessageService().batchView(messageIds);
        return 'todo';
    }

    @Post('/{id}/like')
    public async likeMessage(@Path('id') _id: string) {
        // TODO: return new MessageService().likeMessage(id);
        return {};
    }

    @Post('/{id}/dislike')
    public async dislikeMessage(@Path('id') _id: string) {
        // TODO: return new MessageService().dislikeMessage(id);
        return {};
    }
}
