import UserModel from '@model/user';
import ChannelModel from '@model/channel';
import MessageModel, { IMessage } from '@model/message';
import { HttpError } from '@model/error';
import { MessageCreation, MessageCreationRensponse } from '@model/message';
import mongoose from 'mongoose';

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
            parent = await MessageModel.findOne({ _id: message.parent });
            if (parent === null) throw new HttpError(404, 'Parent not found');
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
            parent: parent?._id,
        });
        savedMessage.save();

        //TODO: aggiungere i messaggio da tutte le parti in cui serve
        if (parent === null) {
            channel.messages.push(savedMessage._id);
            channel.save();
        } else {
            parent.children.push(savedMessage._id);
            parent.save();
        }

        return {
            id: savedMessage._id.toString(),
            channel: savedMessage.channel,
        };
    }

    public async getMessages(ids: string[]): Promise<IMessage[]> {
        console.log(ids);
        return await Promise.all(
            ids.map(async (id) => {
                console.log(id);
                const rens = await MessageModel.findOne({ _id: new mongoose.Types.ObjectId(id) });
                if (rens === null) throw new HttpError(404, 'Message not found');
                else return rens;
            }),
        );
    }

    public async getMessagesWithId(id: string): Promise<IMessage> {
        const rens = await MessageModel.findOne({ _id: id });
        if (rens === null) throw new HttpError(404, 'Message not found');
        else return rens;
    }
}
