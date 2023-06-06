import { Get, Body, Post, Route, Request, Response, Security } from '@tsoa/runtime';
import { getUserFromRequest } from '@api/utils';
import { HttpError } from '@model/error';
import { type ITemporizzati } from '@model/temporizzati';
import { MessageCreationRensponse } from '@model/message';
import { TemporizzatiService } from '@api/temporizzati/temporizzatiService';
/*
    MessageCreation is a type that is used to create a message.
    it has three fields: destination, creator and content.
*/

@Route('/temporizzati')
export class MessageController {
    @Get('')
    @Security('jwt')
    @Response<ITemporizzati[]>(200, 'Messages')
    @Response<HttpError>(400, 'Bad request')
    public async getTermporizzati(@Request() request: any): Promise<ITemporizzati[]> {
        return await new TemporizzatiService().getUser(getUserFromRequest(request));
    }

    @Post('')
    @Security('jwt')
    @Response<ITemporizzati>(204, 'Message Created')
    @Response<HttpError>(400, 'Bad request')
    public async createTemporizzati(
        @Request() request: any,
        @Body() temporizzati: ITemporizzati,
    ): Promise<ITemporizzati> {
        temporizzati.creator = getUserFromRequest(request);
        return await new TemporizzatiService().create(temporizzati);
    }
}
