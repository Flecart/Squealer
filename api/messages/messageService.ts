import { haveEnoughtQuota } from '@model/user';
import { IMessage, ReactionType } from '@model/message';
import { HttpError } from '@model/error';
import { MessageCreation, MessageCreationRensponse } from '@model/message';
import mongoose from 'mongoose';
import UserModel from '@db/user';
import ChannelModel from '@db/channel';
import MessageModel from '@db/message';

export class MessageService {
    public async getOwnedMessages(username: string) {
        return await MessageModel.find({ creator: username });
    }

    public async create(message: MessageCreation, username: string): Promise<MessageCreationRensponse> {
        const creator = await UserModel.findOne({ username: username });
        if (!creator) {
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

        if (message.content.type === 'text') {
            const lenChar = message.content.data.length;
            if (haveEnoughtQuota(creator, lenChar)) {
                console.log(creator);
                creator.usedQuota.day += lenChar;
                creator.usedQuota.week += lenChar;
                creator.usedQuota.month += lenChar;
                creator.markModified('usedQuota');
                creator.save();

                console.log(creator);
            } else {
                throw new HttpError(403, 'Quota exceeded');
            }
        } else {
            //TODO:implementare per gli latri tipi
            throw new HttpError(501, 'Not implemented');
        }

        let savedMessage = new MessageModel({
            channel: channel.name,
            content: message.content,
            children: [],
            creator: username,
            date: new Date(),
            views: 0,
            reaction: [],
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
        console.info(savedMessage);
        return {
            id: savedMessage._id.toString(),
            channel: savedMessage.channel,
        };
    }

    public async getMessages(ids: string[]): Promise<IMessage[]> {
        return await Promise.all(
            ids.map(async (id) => {
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

    public async reactMessage(id: string, type: ReactionType, username: string): Promise<ReactionType> {
        // get message from mongo
        const message = await MessageModel.findOne({ _id: new mongoose.Types.ObjectId(id) });
        if (message == null) throw new HttpError(404, 'Message not found');
        const find = message.reaction.find((reaction) => reaction.id === username);
        if (find) {
            if (type === ReactionType.UNSET) {
                message.reaction = message.reaction.filter((reaction) => reaction.id !== username);
            } else {
                find.type = type;
            }
        } else if (type !== ReactionType.UNSET) message.reaction.push({ id: username, type: type });

        message.markModified('reaction');
        message.save();
        console.info(message);

        return type;
    }
}
