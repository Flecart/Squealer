import { haveEnoughtQuota } from '@model/user';
import { IMessage, IReactionType } from '@model/message';
import { HttpError } from '@model/error';
import { MessageCreation, MessageCreationRensponse } from '@model/message';
import mongoose from 'mongoose';
import UserModel from '@db/user';
import ChannelModel from '@db/channel';
import MessageModel from '@db/message';
import { UploadService } from '@api/upload/uploadService';

export class MessageService {
    public async getOwnedMessages(username: string) {
        return await MessageModel.find({ creator: username });
    }

    public async create(message: MessageCreation, username: string): Promise<MessageCreationRensponse> {
        const creator = await UserModel.findOne({ username: username });
        if (!creator) {
            throw new HttpError(404, 'Username not found');
        }

        if (message.channel.startsWith('@')) {
            const savedMessage = new MessageModel({
                channel: 'test-string',
                content: {
                    type: 'text',
                    data: message.content.data,
                },
                children: [],
                creator: username,
                date: new Date(),
                views: 0,
                reaction: [],
                parent: undefined,
            });
            await savedMessage.save();

            const user = await UserModel.findOne({ username: message.channel.substring(1) });
            user?.messages.push({ message: savedMessage._id, viewed: false });
            user?.save();
            return {
                id: savedMessage._id.toString(),
                channel: '',
            };
        }

        const channel = await ChannelModel.findOne({ name: message.channel });
        if (!channel) {
            throw new HttpError(404, 'Channel not found');
        }

        let parent = null;
        if (mongoose.isValidObjectId(message.parent)) {
            parent = await MessageModel.findOne({ _id: message.parent });
            if (parent === null) throw new HttpError(404, 'Parent not found');
        }

        let lenChar = 0;
        let messageContent: IMessage['content'];
        if (message.content.type === 'text') {
            const data: string = message.content.data as string;
            lenChar = data.length;
            messageContent = message.content;
        } else if (message.content.type === 'image') {
            const data: Express.Multer.File = message.content.data as Express.Multer.File;
            const path = await new UploadService().uploadFile(data);
            lenChar = 100; // TODO: sostituire con costante dalla config
            messageContent = {
                type: message.content.type,
                data: path.path,
            };
        } else {
            //TODO:implementare per gli latri tipi
            throw new HttpError(501, 'Message type is not implemented');
        }

        if (haveEnoughtQuota(creator, lenChar)) {
            creator.usedQuota.day += lenChar;
            creator.usedQuota.week += lenChar;
            creator.usedQuota.month += lenChar;
            creator.markModified('usedQuota');
            creator.save();
            console.log(`Daily quota updated to ${creator.usedQuota.day}`);
        } else {
            throw new HttpError(403, 'Quota exceeded');
        }

        const savedMessage = new MessageModel({
            channel: channel.name,
            content: messageContent,
            children: [],
            creator: username,
            date: new Date(),
            views: 0,
            reaction: [],
            parent: parent?._id,
        });
        await savedMessage.save();

        //TODO: aggiungere i messaggio da tutte le parti in cui serve
        if (parent === null) {
            channel.messages.push(savedMessage._id);
            await channel.save();
        } else {
            parent.children.push(savedMessage._id);
            await parent.save();
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
                rens.views++;
                rens.save();
                return rens;
            }),
        );
    }

    public async getMessagesWithId(id: string): Promise<IMessage> {
        const rens = await MessageModel.findOne({ _id: id });
        if (rens === null) throw new HttpError(404, 'Message not found');
        rens.views++;
        rens.save();
        return rens;
    }

    public async reactMessage(id: string, type: IReactionType, username: string): Promise<IReactionType> {
        // get message from mongo
        const message = await MessageModel.findOne({ _id: new mongoose.Types.ObjectId(id) });
        if (message == null) throw new HttpError(404, 'Message not found');
        const userReaction = message.reaction.find((reaction) => reaction.id === username);
        if (userReaction) {
            if (type === IReactionType.UNSET) {
                message.reaction = message.reaction.filter((reaction) => reaction.id !== username);
            } else {
                userReaction.type = type;
            }
        } else if (type !== IReactionType.UNSET) message.reaction.push({ id: username, type: type });

        message.markModified('reaction');
        message.save();
        console.info(message);

        return type;
    }
}
