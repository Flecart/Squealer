import { Get, Route, Response, Security, Request } from '@tsoa/runtime';
import { FeedService } from './feedService';
import { getMaybeUserFromRequest } from '@api/utils';

/*
    MessageCreation is a type that is used to create a message.
    it has three fields: destination, creator and content.
*/

@Route('/feed')
export class FeedController {
    @Get('/')
    @Security('maybeJWT')
    @Response<string[]>(200, 'OK')
    public async readAll(@Request() request: any): Promise<string[]> {
        return new FeedService().getMessages(getMaybeUserFromRequest(request));
    }
}
