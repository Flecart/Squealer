import { UserRoles } from '@model/user';
import UserModel from '@db/user';
import MessageModel from '@db/message';
import AuthModel from '@db/auth';
import ChannelModel from '@db/channel';
import { HttpError } from '@model/error';
import { UserModRensponse } from '@model/user';
import { IQuotas } from '@model/quota';
import { IMessage, IReactionType } from '@model/message';
import { HydratedDocument } from 'mongoose';

export interface FilterPosts {
    username?: string;
    channel?: string;
    from?: Date;
    to?: Date;
    limit?: number;
    type?: string;
    contain?: string;
}

export interface ReactionRequest {
    love: number;
    like: number;
    dislike: number;
    angry: number;
}

export class ModdashService {
    public async changeQuota(admin: string, user: string, quota: IQuotas): Promise<void> {
        await this.checkModerator(admin);

        const target = await UserModel.findOne({ name: user });
        if (!target) throw new HttpError(404, 'User not found');
        target.maxQuota = quota;
        await target.save();
    }
    public async suspendUser(admin: string, user: string, suspended: boolean): Promise<void> {
        await this.checkModerator(admin);
        const target = await AuthModel.findOne({ username: user });
        if (!target) throw new HttpError(404, 'User not found');
        target.set('suspended', suspended);
        await target.save();
    }

    public async listUsers(userId: string): Promise<UserModRensponse[]> {
        await this.checkModerator(userId);
        const all = await UserModel.find({ roule: { $ne: UserRoles.MODERATOR } });
        const res: UserModRensponse[] = [];
        for (let user of all) {
            const auth = await AuthModel.findOne({ username: user.name });
            if (auth) {
                res.push({
                    suspended: auth.suspended,
                    name: user.name,
                    username: user.username,
                    profile_pic: user.profile_pic,
                    channels: user.channels,
                    usedQuota: user.usedQuota,
                    maxQuota: user.maxQuota,
                    clients: user.clients,
                    messages: user.messages,
                    channel: user.channel,
                    role: user.role,
                } as UserModRensponse);
            }
        }
        return res;
    }

    public async listPosts(userId: string, filter: FilterPosts): Promise<any> {
        await this.checkModerator(userId);
        const query: any = {};
        if (filter.username) query.creator = filter.username;
        if (filter.channel) query.channel = filter.channel;
        if (filter.from) query.date = { $gte: filter.from };
        if (filter.to) query.date = { ...query.date, $lte: filter.to };
        if (filter.type) {
            query['content.type'] = filter.type;
        }
        let posts;
        if (filter.limit) posts = await MessageModel.find(query).limit(filter.limit);
        else posts = await MessageModel.find(query);
        return posts;
    }

    public async changeReaction(userId: string, messageId: string, reaction: ReactionRequest): Promise<void> {
        await this.checkModerator(userId);
        const message = await MessageModel.findOne({ _id: messageId });
        if (!message) throw new HttpError(404, 'Message not found');
        await this.changeReactionToMessage(message, reaction.love, IReactionType.LOVE);
        await this.changeReactionToMessage(message, reaction.like, IReactionType.LIKE);
        await this.changeReactionToMessage(message, reaction.dislike, IReactionType.DISLIKE);
        await this.changeReactionToMessage(message, reaction.angry, IReactionType.ANGRY);
    }

    private async changeReactionToMessage(
        message: HydratedDocument<IMessage>,
        many: number,
        type: IReactionType,
    ): Promise<void> {
        const reaction = message.reaction.filter((r) => r.type === type);
        let count = reaction.length;
        if (count <= many) {
            for (let i = 0; i < many - count; i++) {
                message.reaction.push({ type, id: 'squealer' });
            }
        } else {
            const toRemove = count - many;
            const reactionToRemove = reaction.slice(0, toRemove);
            const otherReaction = message.reaction.filter((r) => r.type !== type);
            message.reaction = [...otherReaction, ...reactionToRemove];
        }
        await message.save();
    }

    private async checkModerator(userId: string): Promise<void> {
        const user = await UserModel.findOne({ name: userId });
        if (!user) throw new HttpError(404, 'User not found');
        if (user.role !== UserRoles.MODERATOR) throw new HttpError(403, 'You are not a moderator');
    }

    public async deletePost(userId: string, messageId: string): Promise<void> {
        await this.checkModerator(userId);
        await this.recursiveDelition(messageId);
    }
    public async copyMessage(admin: string, messageId: string, channel: string): Promise<void> {
        await this.checkModerator(admin);
        const message = await MessageModel.findOne({ _id: messageId });
        if (!message) throw new HttpError(404, 'Message not found');
        const toChannel = await ChannelModel.findOne({ name: channel });
        if (!toChannel) throw new HttpError(404, 'Channel not found');
        const newMessage = new MessageModel({
            content: message.content,
            creator: 'squealer',
            channel: channel,
            parent: null,
            date: new Date(),
            children: [],
            reaction: [],
            views: 0,
            category: 0,
        });
        await newMessage.save();
        toChannel.messages.push(newMessage._id);
        await toChannel.save();
    }
    private async recursiveDelition(messageId: string): Promise<void> {
        const message = await MessageModel.findOne({ _id: messageId });
        if (!message) throw new HttpError(404, 'Message not found');
        if (message.channel !== null || message.channel !== undefined) {
            const channel = await ChannelModel.findOne({ name: message.channel });
            if (channel) {
                channel.messages = channel.messages.filter((m) => m.toString() !== messageId);
                channel.markModified('messages');
                await channel.save();
            }
        }
        if (message.creator !== null || message.creator !== undefined) {
            const user = await UserModel.findOne({ name: message.creator });
            if (user) {
                user.messages = user.messages.filter((m) => m.toString() !== messageId);
                user.markModified('messages');
                await user.save();
            }
        }
        const messages = message.children.slice();
        await message.deleteOne();
        for (let child of messages) {
            await this.recursiveDelition(child.toString());
        }
    }
}
