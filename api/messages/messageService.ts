import UserModel from '@model/user';
import ChannelModel from '@model/channel';
import MessageModel, { IMessage } from '@model/message';
import { HttpError } from '@model/error';
import { MessageCreation, MessageCreationRensponse } from '@model/message';

export class MessageService {
    
    public async getOwnedMessages(username: string) {
        return await MessageModel.find({ creator: username });
    }

    public async create(message: MessageCreation, username: string): Promise<MessageCreationRensponse> {
        const creatorName = await UserModel.findOne({ username: username });
        if (!creatorName) {
            throw new HttpError(404, 'Username not found');
        }

        const channel = await ChannelModel.findOne({ name: message.channel });
        if (!channel) {
            throw new HttpError(404, 'Channel not found');
        }

        let parent = null;
        if (message.parent !== undefined) {
            // FIXME: message parent non è un id
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
            parent,
        });
        savedMessage.save();

        //TODO: aggiungere i messaggio da tutte le parti in cui serve
        if (message.parent === undefined) {
            channel.messages.push(savedMessage._id);
            channel.save();
        }
        return {
            _id: savedMessage._id,
            channel: savedMessage.channel,
        };
    }

    public async getMessages(id: string | null) {
        return await MessageModel.find(id === null ? {} : { _id: id });
    }
}
