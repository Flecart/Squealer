import {
    IMessage,
    MessageCreation,
    IReactionType,
    MapPosition,
    type MessageCreationRensponse,
    type ReactionResponse,
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
import { getUserFromRequest, parseMessageCreationWithFile } from '@api/utils';
import { HttpError } from '@model/error';
/*
    MessageCreation is a type that is used to create a message.
    it has three fields: destination, creator and content.
*/

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
    public async userMessage(@Path('username') user: string): Promise<IMessage[]> {
        return new MessageService().getOwnedMessages(user);
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
