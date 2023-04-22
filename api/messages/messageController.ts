import {Get, Body,Post,  Route, Response, Path } from '@tsoa/runtime';
import { IMessage } from '@model/message'
import { MessageService } from './messageService';

/*
    MessageCreation is a type that is used to create a message.
    it has three fields: destination, creator and content.
*/
export type MessageCreation = Pick<IMessage, 'destination' | 'creator' | 'content'>;

@Route('/message')
export class MessageController {
    @Post('')
    public async createMessage(
        @Body() body_data: MessageCreation
    ) {
        await new MessageService().create(body_data.destination, body_data.creator, body_data.content);
    }
    
    @Get('/')
    @Response<IMessage[]>(200, 'OK')
    public async readAll(): Promise<IMessage[]> {
        return new MessageService().getMessages();
    }

    @Get('/{id}/')
    @Response<IMessage[]>(200, 'OK')
    public async readThread(
        @Path('id') _id: string
    ): Promise<IMessage[]> {
        return new MessageService().getMessages();
    }
    
    @Post('/batch-view')
    public async batchView(@Body() _messageIds: string[]) {
        // TODO: return new MessageService().batchView(messageIds);
        return "todo";
    }

    @Post('/{id}/like')
    public async likeMessage(@Path("id") _id: string) {
        // TODO: return new MessageService().likeMessage(id);
        return {};
    }

    @Post('/{id}/dislike')
    public async dislikeMessage(@Path("id") _id: string) {
        // TODO: return new MessageService().dislikeMessage(id);
        return {};
    }

}