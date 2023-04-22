import {Get, Body,Post,  Route, Response } from '@tsoa/runtime';
import { IMessage } from '../../model/message'
import { MessageService } from './messageService';

/*
    MessageCreation is a type that is used to create a message.
    it has three fields: destination, creator and content.
*/
export type MessageCreation = Pick<IMessage, 'destination' | 'creator' | 'content'>;

@Route('/api/message')
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
}