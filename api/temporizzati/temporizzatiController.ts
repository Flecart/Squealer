import { Get, Body, Post, Route, Request, Response, Security } from '@tsoa/runtime';
import { getUserFromRequest } from '@api/utils';
import { HttpError } from '@model/error';
import { ContentInput, type ITemporizzati } from '@model/temporizzati';
import { TemporizzatiService } from '@api/temporizzati/temporizzatiService';

@Route('/temporizzati')
export class TemporizzatiController {
    @Get('')
    @Security('jwt')
    @Response<ITemporizzati[]>(200, 'Messages')
    @Response<HttpError>(400, 'Bad request')
    public async getTemporizzati(@Request() request: any): Promise<ITemporizzati[]> {
        return await new TemporizzatiService().getUser(getUserFromRequest(request));
    }

    @Post('')
    @Security('jwt')
    @Response<ITemporizzati>(204, 'Message Created')
    @Response<HttpError>(400, 'Bad request')
    public async createTemporizzati(
        @Request() request: any,
        @Body() contentInput: ContentInput,
    ): Promise<ITemporizzati> {
        return await new TemporizzatiService().create(contentInput, getUserFromRequest(request));
    }
}
