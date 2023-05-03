import UserModel from '@model/user';
import ChannelModel from '@model/channel';
import MessageModel, { Img, Maps } from '@model/message';
import { HttpError } from '@model/error';
import { MessageCreation } from '@model/message';

export class MessageService {
    public async create(message: MessageCreation, username: string) {
        const creatorName = await UserModel.findOne({ username: username });

        if (!creatorName) {
            throw new HttpError(404, 'Username not found');
        }

        const channel = await ChannelModel.findOne({ name: message.destination });

        if (!channel) {
            throw new HttpError(404, 'Channel not found');
        }
        if (message.parent !== null) {
            if (await MessageModel.findOne({ _id: message.parent })) throw new HttpError(404, 'Parent not found');
        }

        const savedMessage = new MessageModel({
            channel: channel._id,
            parent: message.parent,
            content: message.content,
            children: [],
            creator: username,
            date: new Date(),
            views: 0,
            posReaction: [],
            negReaction: [],
        }).save();

        //TODO: aggiungere i messaggio da tutte le parti in cui serve
        if (message.parent === null) {
            channel.messages.push(message.parent);
            channel.save();
        }
        return savedMessage;
    }

    public async getMessages(id: string|null) {
        return await MessageModel.find(id===null?{}:{_id:id});
    }
}
