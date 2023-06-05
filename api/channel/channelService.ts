import { HttpError } from '@model/error';
import MessageModel from '@db/message';
import { IChannel, ChannelType, PermissionType, ChannelResponse } from '@model/channel';
import { type Invitation } from '@model/message';
import { HydratedDocument } from 'mongoose';
import ChannelModel from '@db/channel';
import UserModel from '@db/user';

export class ChannelService {
    public async list(user: string | null): Promise<IChannel[]> {
        const publicChannel = await ChannelModel.find({
            $or: [{ type: ChannelType.SQUEALER }, { type: ChannelType.PUBLIC }],
        });
        if (user === null) {
            return publicChannel;
        }
        //TODO da testare
        const userChannel = await ChannelModel.find({
            $or: [{ type: ChannelType.USER }, { type: ChannelType.PRIVATE }],
            users: { $elemMatch: { user: user } },
        });
        return publicChannel.concat(userChannel);
    }

    public async getChannel(channelName: string, user: string | null): Promise<IChannel> {
        const channel = await ChannelModel.findOne({ name: channelName });
        if (channel === null) {
            throw new HttpError(400, `Channel with name ${channelName} does not exist`);
        }
        if (channel.type === ChannelType.PRIVATE || channel?.type === ChannelType.USER) {
            if (user === null) {
                throw new HttpError(401, `User is not logged in`);
            }
            if (channel.users.filter((u) => u.user === user).length === 0) {
                throw new HttpError(403, `User ${user} is not authorized to access channel ${channelName}`);
            }
        }
        return channel;
    }

    public async create(
        channelName: string,
        owner: string,
        type: ChannelType,
        description?: string,
        isFromApi?: boolean,
    ): Promise<any> {
        let fromApi = isFromApi ?? false;
        const ownerUser = await UserModel.findOne({ username: owner });

        if (fromApi && !(type === ChannelType.PUBLIC || type === ChannelType.PRIVATE)) {
            throw new HttpError(400, `Channel type ${type} is not valid from api call`);
        }
        if (fromApi && (channelName.startsWith('#') || channelName.startsWith('@'))) {
            throw new HttpError(400, `Channel name ${channelName} is not valid name`);
        }

        if (type === ChannelType.SQUEALER) {
            channelName = channelName.toUpperCase();
        } else {
            channelName = channelName.toLowerCase();
        }
        if (ownerUser === null) {
            throw new HttpError(400, `Owner with username ${owner} does not exist`);
        } else if ((await ChannelModel.findOne({ name: channelName })) !== null) {
            throw new HttpError(400, 'Channel name already exists');
        }

        const channel = new ChannelModel({
            name: channelName,
            description: description ?? '',
            type: type,
            users: [],
            messages: [],
        });

        if (type === ChannelType.PRIVATE || type === ChannelType.PUBLIC) {
            channel.users.push({ user: owner, privilege: PermissionType.ADMIN, notification: true });
            ownerUser.channel.push(channelName);
            ownerUser.markModified('channel');
            ownerUser.save();
        } else if (type === ChannelType.USER) {
            channelName
                .substring(1)
                .split('-')
                .forEach(async (u) => {
                    channel.users.push({ user: u, privilege: PermissionType.READWRITE, notification: true });
                    const user = await UserModel.findOne({ username: u });
                    if (user !== null) {
                        user.channel.push(channelName);
                        user.markModified('channel');
                        user.save();
                    }
                });
        }
        channel.save();
        if (fromApi) {
            return channel;
        }

        return { message: 'Channel created', channel: channelName };
    }

    public async updateDescription(
        channelName: string,
        description: string,
        issuer_name: string,
    ): Promise<ChannelResponse> {
        const channel = await ChannelModel.findOne({ name: channelName });
        if (channel === null) {
            throw new HttpError(400, `Channel with name ${channelName} does not exist`);
        }
        const userPermission = channel.users.find((u) => u.user === issuer_name)?.privilege;
        if (userPermission === undefined || userPermission !== PermissionType.ADMIN) {
            throw new HttpError(403, `User ${issuer_name} is not authorized to update channel ${channelName}`);
        }

        channel.description = description;
        await channel.save();

        return { message: `Channel description updated to ${description}`, channel: channelName };
    }

    public async joinChannel(channelName: string, username: string, fromApi: boolean): Promise<ChannelResponse> {
        const channel = await ChannelModel.findOne({ name: channelName });
        const user = await UserModel.findOne({ username: username });
        if (user === null) {
            throw new HttpError(400, `User with username ${username} does not exist`);
        }
        if (channel === null) {
            throw new HttpError(400, `Channel with name ${channelName} does not exist`);
        }
        if (fromApi && (channel.type === ChannelType.PRIVATE || channel?.type === ChannelType.USER)) {
            throw new HttpError(400, `Channel with name ${channelName} is private`);
        }
        if (channel.users.find((u) => u.user === username) === undefined) {
            channel.users.push({ user: username, privilege: PermissionType.READWRITE, notification: true });
            channel.markModified('users');
            await channel.save();
        }
        if (user.channel.find((c) => c === channelName) === undefined) {
            user.channel.push(channelName);
            user.markModified('channel');
            await user.save();
        }
        return { message: `User ${username} joined channel ${channelName}`, channel: channelName };
    }

    public async leaveChannel(channelName: string, username: string): Promise<ChannelResponse> {
        const channel = await ChannelModel.findOne({ name: channelName });
        const user = await UserModel.findOne({ username: username });
        if (channel === null) {
            throw new HttpError(400, `Channel with name ${channelName} does not exist`);
        }
        if (user === null) {
            throw new HttpError(400, `User with username ${username} does not exist`);
        }
        if (channel.users.find((u) => u.user === username) !== undefined) {
            channel.users = channel.users.filter((u) => u.user !== username);
            channel.markModified('users');
            await channel.save();
        }
        if (user.channel.find((c) => c === channelName) !== undefined) {
            user.channel = user.channel.filter((c: string) => c !== channelName);
            user.markModified('channel');
            await user.save();
        }
        return { message: `User ${username} left channel ${channelName}`, channel: channelName };
    }

    public async setNotify(channelName: string, notification: boolean, username: string): Promise<ChannelResponse> {
        const channel = await ChannelModel.findOne({ name: channelName });
        if (channel === null) {
            throw new HttpError(400, `Channel with name ${channelName} does not exist`);
        }
        const myrecord = channel.users.find((u) => u.user === username);
        if (myrecord === undefined) {
            throw new HttpError(400, `User with username ${username} is not in channel ${channelName}`);
        }
        myrecord.notification = notification;
        channel.markModified('users');
        await channel.save();
        return {
            message: `User ${username} set notification to ${notification} for channel ${channelName}`,
            channel: channelName,
        };
    }

    public async deleteChannel(channelName: string, username: string): Promise<ChannelResponse> {
        return { message: `TODO: User ${username} deleted channel ${channelName}`, channel: channelName };
    }

    public async addMember(channel: string, userToAdd: string, userIssuer: string, permission: PermissionType) {
        const toAdd = await UserModel.findOne({ username: userToAdd });
        const issuer = await UserModel.findOne({ username: userIssuer });
        if (toAdd == null || issuer == null) {
            throw new HttpError(400, `User with username ${userToAdd} or ${userIssuer} does not exist`);
        }
        const channelObj = await ChannelModel.findOne({ name: channel });

        if (channelObj == null) {
            throw new HttpError(400, 'channel not found');
        }
        const permissionIssuer = channelObj.users.find((user) => user.user == userIssuer)?.privilege;
        if (permissionIssuer === null || permissionIssuer !== PermissionType.ADMIN) {
            throw new HttpError(403, "Don't have the right to do this operation");
        }
        const content: Invitation = {
            to: userToAdd,
            channel,
            permission,
        };
        const message = new MessageModel({
            content: {
                type: 'invitation',
                data: content,
            },
            channel: null,
            children: [],
            creator: userIssuer,
            date: new Date(),
            parent: null,
            reaction: [],
            views: 0,
        });
        await message.save();

        toAdd.messages.push({ message: message._id, viewed: false });
        await toAdd.save();
    }

    async getOwnerNames(_channel: HydratedDocument<IChannel>): Promise<string[]> {
        // if (isMultiOwnerChannel(channel)) {
        //     const owners = await AuthModel.find({ userId: { $in: channel.members.ownerRef } });
        //     return owners.map((owner: IUserAuth) => owner.username);
        // } else {
        //     const owner = await AuthModel.findOne({ userId: channel.ownerRef });
        //     if (owner === null) {
        //         throw new HttpError(500, `User with id ${channel.ownerRef} does not exist`);
        //     }
        //     return [owner.username];
        // }
        return [];
    }
}
