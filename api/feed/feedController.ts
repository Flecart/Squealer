import { Get, Route, Response } from '@tsoa/runtime';
import { IMessage } from '@model/message';
import { FeedService } from './feedService';

/*
    MessageCreation is a type that is used to create a message.
    it has three fields: destination, creator and content.
*/

@Route('/feed')
export class FeedController {
    @Get('/')
    @Response<IMessage[]>(200, 'OK')
    public async readAll(): Promise<IMessage[]> {
        return new FeedService().getMessages();
    }
}
