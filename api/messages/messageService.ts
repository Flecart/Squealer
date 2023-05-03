import UserModel from '@model/user';
import ChannelModel from '@model/channel';
import MessageModel from '@model/message';
import { HttpError } from '@model/error';
import { MessageCreation } from '@model/message';

export class MessageService {
    public async getOwnedMessages(username: string) {
        return await MessageModel.find({ creator: username });
    }
    public async create(message: MessageCreation, username: string) {
        const creatorName = await UserModel.findOne({ username: username });

        if (!creatorName) {
            throw new HttpError(404, 'Username not found');
        }

        const channel = await ChannelModel.findOne({ name: message.channel });

        if (!channel) {
            throw new HttpError(404, 'Channel not found');
        }
        let parent = null;
        if (message.parent !== null) {
            const tmp = await MessageModel.findOne({ _id: message.parent });
            if (tmp === null) throw new HttpError(404, 'Parent not found');
            else parent = tmp._id;
        }

        let savedMessage = new MessageModel({
            channel: channel.name,
            content: message.content,
            children: [],
            creator: username,
            date: new Date(),
            views: 0,
            posReaction: [],
            negReaction: [],
        });
        if (parent !== null) savedMessage.parent = parent;
        savedMessage.save();

        //TODO: aggiungere i messaggio da tutte le parti in cui serve
        if (message.parent === null) {
            channel.messages.push(message.parent);
            channel.save();
        }
        return savedMessage;
    }

    public async getMessages(id: string | null) {
        return await MessageModel.find(id === null ? {} : { _id: id });
    }
}
