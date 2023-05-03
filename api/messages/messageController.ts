import { Get, Body, Post, Route, Request, Response, Path, Security } from '@tsoa/runtime';
import { IMessage, MessageWithId } from '@model/message';
import { MessageService } from './messageService';
import { getUserFromRequest } from '@api/utils';

/*
    MessageCreation is a type that is used to create a message.
    it has three fields: destination, creator and content.
*/
export type MessageCreation = Pick<IMessage, 'content'> & {
    destination: string;
};

@Route('/message')
export class MessageController {
    @Post('')
    @Security('jwt')
    @Response<IMessage>(204, 'Message Created')
    @Response<Error>(400, 'Bad request')
    public async createMessage(@Body() body_data: MessageCreation, @Request() request: any) {
        await new MessageService().create(body_data.destination, body_data.content, getUserFromRequest(request));
    }

    @Get('/')
    @Response<IMessage[]>(200, 'OK')
    public async readAll(): Promise<IMessage[]> {
        return new MessageService().getMessages();
    }

    @Get('/{id}/')
    @Response<MessageWithId[]>(200, 'OK')
    public async readThread(@Path('id') _id: string): Promise<MessageWithId[]> {
        return new MessageService().getMessages();
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
