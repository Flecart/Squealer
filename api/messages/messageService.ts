import { IUser, haveEnoughtQuota } from '@model/user';
import {
    IMessage,
    IReactionType,
    ICategory,
    CriticMass,
    Maps,
    MapPosition,
    type ReactionResponse,
} from '@model/message';
import { HttpError } from '@model/error';
import { ChannelType, IChannel, PermissionType, isPublicChannel } from '@model/channel';
import { MessageCreation, MessageCreationRensponse } from '@model/message';
import mongoose from 'mongoose';
import UserModel from '@db/user';
import ChannelModel, { getUserChannelName } from '@db/channel';
import MessageModel from '@db/message';
import { UploadService } from '@api/upload/uploadService';
import { ChannelService } from '@api/channel/channelService';
import UserService from '@api/user/userService';
import { DEFAULT_QUOTA } from '@config/api';

type ChannelModelType = mongoose.HydratedDocument<IChannel>;
type MessageModelType = mongoose.HydratedDocument<IMessage>;
type UserModelType = mongoose.HydratedDocument<IUser>;

export class MessageService {
    public async getOwnedMessages(username: string) {
        const messages = (await MessageModel.find({ creator: username })).filter(async (message) => {
            const channel = await ChannelModel.findOne({ name: message.channel });
            if (channel !== null && isPublicChannel(channel)) return true;
            return false;
        });
        return messages;
    }

    public async create(message: MessageCreation, username: string): Promise<MessageCreationRensponse> {
        const creator = await UserModel.findOne({ username: username });
        if (!creator) {
            throw new HttpError(404, 'Username not found');
        }

        let channel = null;
        let parent = null;
        if (message.channel !== undefined) channel = await this._getChannel(username, message.channel);
        else if (message.parent !== undefined) {
            parent = await MessageModel.findOne({ _id: message.parent });
            if (parent === null) throw new HttpError(404, 'Parent not found');
        } else {
            throw new HttpError(400, 'Invalid no parent nor channel');
        }

        let [messageContent, lenChar] = await this._getMessageContent(message);

        await this._updateQuota(creator, lenChar);

        const savedMessage = new MessageModel({
            channel: channel?.name,
            content: messageContent,
            children: [],
            creator: username,
            date: new Date(),
            views: 0,
            reaction: [],
            parent: parent?._id,
            category: ICategory.NORMAL,
            positiveReactions: 0,
            negativeReactions: 0,
        });
        await savedMessage.save();

        console.log(savedMessage);
        await this._sendNotification(savedMessage, channel, parent);
        return {
            id: savedMessage._id.toString(),
            channel: savedMessage.channel,
        };
    }

    public async updatePosition(
        id: string,
        position: MapPosition,
        username: string,
    ): Promise<MessageCreationRensponse> {
        const message = await MessageModel.findOne({ _id: new mongoose.Types.ObjectId(id) });
        if (message == null) throw new HttpError(404, 'Message not found');
        else if (message.creator !== username) throw new HttpError(401, 'Not authorized');
        else if (message.content.type !== 'maps') throw new HttpError(400, 'Message is not a map');

        (message.content.data as Maps).positions.push(position);
        message.markModified('content');
        await message.save();
        return {
            id: message._id.toString(),
            channel: message.channel,
        };
    }

    public async getMessages(ids: string[]): Promise<IMessage[]> {
        //TODO: va tolta per metterci il feed al suo posto
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

    public async reactMessage(id: string, type: IReactionType, username: string): Promise<ReactionResponse> {
        // get message from mongo
        const message = await MessageModel.findOne({ _id: new mongoose.Types.ObjectId(id) });
        if (message == null) throw new HttpError(404, 'Message not found');
        const userReaction = message.reaction.find((reaction) => reaction.id === username);

        const precCategory = message.category;

        if (userReaction) {
            if (type === IReactionType.UNSET) {
                message.reaction = message.reaction.filter((reaction) => reaction.id !== username);
            } else {
                userReaction.type = type;
            }
        } else if (type !== IReactionType.UNSET) {
            message.reaction.push({ id: username, type: type });
        }

        let negativeReactions = 0;
        let positiveReactions = 0;

        message.reaction.forEach((reaction) => {
            switch (reaction.type) {
                case IReactionType.ANGRY:
                    negativeReactions += 2;
                    break;

                case IReactionType.DISLIKE:
                    negativeReactions += 1;
                    break;

                case IReactionType.LIKE:
                    positiveReactions += 1;
                    break;

                case IReactionType.LOVE:
                    positiveReactions += 2;
                    break;

                default:
                    break;
            }
        });

        if (negativeReactions > CriticMass && positiveReactions > CriticMass) {
            message.category = ICategory.CONTROVERSIAL;
        } else if (negativeReactions > CriticMass) {
            message.category = ICategory.UNPOPULAR;
            if (precCategory != ICategory.UNPOPULAR) {
                this._addMaxQuota(username, -1);
            }
        } else if (positiveReactions > CriticMass) {
            message.category = ICategory.POPULAR;
            if (precCategory != ICategory.POPULAR) {
                this._addMaxQuota(username, +1);
            }
        } else {
            if (precCategory === ICategory.POPULAR) {
                this._addMaxQuota(username, -1);
            }
            if (precCategory === ICategory.UNPOPULAR) {
                this._addMaxQuota(username, +1);
            }
            message.category = ICategory.NORMAL;
        }

        message.markModified('reaction');
        message.save();
        console.info(message);

        return { reaction: type, category: message.category };
    }

    private async _getChannel(username: string, channelName: string): Promise<ChannelModelType> {
        let channel = null;
        if (channelName.startsWith('@')) {
            if (channelName === `@${username}`) {
                throw new HttpError(400, "You can't send a message to yourself");
            }
            if (UserModel.findOne({ username: channelName.substring(1) }) === null) {
                throw new HttpError(404, 'User not found');
            }

            channel = await ChannelModel.findOne({ name: getUserChannelName(username, channelName.substring(1)) });
            if (!channel) {
                channel = new ChannelService().create(
                    getUserChannelName(username, channelName.substring(1)),
                    username,
                    ChannelType.USER,
                    '',
                    false,
                );
            }
        } else if (channelName.startsWith('#')) {
            channel = await ChannelModel.findOne({ name: channelName });
            if (!channel) {
                channel = new ChannelModel({
                    name: channelName,
                    type: ChannelType.HASHTAG,
                    messages: [],
                    users: [],
                });
                await channel.save();
            }
        } else {
            channel = await ChannelModel.findOne({ name: channelName });
            if (!channel) {
                throw new HttpError(404, 'Channel not found');
            }

            if (
                channel.users.filter(
                    (user) =>
                        user.user === username &&
                        (user.privilege === PermissionType.READWRITE ||
                            user.privilege === PermissionType.WRITE ||
                            user.privilege === PermissionType.ADMIN),
                ).length === 0
            ) {
                throw new HttpError(403, "You don't have the permission to write in this channel");
            }
        }
        return channel;
    }

    private async _getMessageContent(message: MessageCreation): Promise<[IMessage['content'], number]> {
        if (message.content.type === 'text') {
            const data: string = message.content.data as string;
            return [message.content, data.length];
        } else if (message.content.type === 'image' || message.content.type === 'video') {
            const data: Express.Multer.File = message.content.data as Express.Multer.File;
            const path = await new UploadService().uploadFile(data);
            return [
                {
                    type: message.content.type,
                    data: path.path,
                },
                100,
            ];
        } else if (message.content.type === 'maps') {
            return [message.content, 100];
        } else {
            throw new HttpError(400, `Message type ${message.content.type} is not supported`);
        }
    }

    private async _updateQuota(creator: UserModelType, lenChar: number): Promise<void> {
        if (haveEnoughtQuota(creator, lenChar)) {
            creator.usedQuota.day += lenChar;
            creator.usedQuota.week += lenChar;
            creator.usedQuota.month += lenChar;
            creator.markModified('usedQuota');
            await creator.save();
            console.log(`Daily quota updated to ${creator.usedQuota.day}`);
        } else {
            throw new HttpError(403, 'Quota exceeded');
        }
    }

    private async _addMaxQuota(username: string, quota: number): Promise<void> {
        const user = await UserModel.findOne({ username: username }, 'maxQuota').exec();
        if (user == null) throw new HttpError(404, 'User not Found');
        let quotaDay = DEFAULT_QUOTA.day * (quota / 100);
        let quotaWeek = DEFAULT_QUOTA.week * (quota / 100);
        let quotaMonth = DEFAULT_QUOTA.month * (quota / 100);
        new UserService().changeQuota(user, quotaDay, quotaWeek, quotaMonth);
    }

    private async _sendNotification(
        savedMessage: MessageModelType,
        channel: ChannelModelType | null,
        parent: MessageModelType | null,
    ): Promise<void> {
        if (channel !== null) {
            channel.users
                .filter((user) => user.notification)
                .forEach(async (user: any) => {
                    user = await UserModel.findOne({ username: user.user });
                    if (user) {
                        user.messages.push({ message: savedMessage._id, viewed: false });
                        await user.save();
                    }
                });
            channel.messages.push(savedMessage._id);
            await channel.save();
        } else if (parent !== null) {
            parent.children.push(savedMessage._id);
            await parent.save();
            const parentUser = await UserModel.findOne({ username: parent.creator });
            if (parentUser) {
                parentUser.messages.push({ message: savedMessage._id, viewed: false });
                await parentUser.save();
            }
        }
    }
}
