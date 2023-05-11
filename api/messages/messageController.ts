import { IMessage, MessageCreation, IReactionType, type MessageCreationRensponse } from '@model/message';
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
import { getUserFromRequest } from '@api/utils';
import { HttpError } from '@model/error';
/*
    MessageCreation is a type that is used to create a message.
    it has three fields: destination, creator and content.
*/

@Route('/message')
export class MessageController {
    @Post('')
    @Security('jwt')
    @Response<IMessage>(204, 'Message Created')
    @Response<HttpError>(400, 'Bad request')
    public async createMessage(
        @FormField() data: string,
        @Request() request: any,
        @UploadedFile('file') file?: Express.Multer.File,
    ): Promise<MessageCreationRensponse> {
        console.info(`MessageController.createMessage: ${data} from ${getUserFromRequest(request)}`);
        // TODO: validate data
        const bodyData: MessageCreation = JSON.parse(data);

        if (bodyData.content.type == 'image' || bodyData.content.type == 'video') {
            if (file == undefined) throw new HttpError(400, 'File attachment is undefined');
            else bodyData.content.data = file;
        }

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

    @Post('/{id}/reaction')
    @Security('jwt')
    public async reatMessage(
        @Request() req: any,
        @Path('id') id: string,
        @Body() reaction: { type: IReactionType },
    ): Promise<IReactionType> {
        return new MessageService().reactMessage(id, reaction.type, getUserFromRequest(req));
    }
}
