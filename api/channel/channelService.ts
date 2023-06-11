import { HttpError } from '@model/error';
import MessageModel from '@db/message';
import { IChannel, ChannelType, PermissionType, ChannelResponse, sortChannel } from '@model/channel';
import { ICategory, type Invitation } from '@model/message';
import ChannelModel from '@db/channel';
import UserModel from '@db/user';
import { UserRoles } from '@model/user';

export class ChannelService {
    public async list(user: string | null): Promise<IChannel[]> {
        let publicChannel = await ChannelModel.find({
            $or: [{ type: ChannelType.SQUEALER }, { type: ChannelType.PUBLIC }],
        });

        if (user !== null) {
            const userChannel = await ChannelModel.find({
                $or: [{ type: ChannelType.USER }, { type: ChannelType.PRIVATE }],
                users: { $elemMatch: { user: user } },
            });
            publicChannel = publicChannel.concat(userChannel);
        }
        return publicChannel.sort(sortChannel);
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
    ): Promise<ChannelResponse> {
        let fromApi = isFromApi ?? false;
        const ownerUser = await UserModel.findOne({ username: owner });

        if (ownerUser === null) {
            throw new HttpError(400, `User with username ${owner} does not exist`);
        }

        if (fromApi && !(type === ChannelType.PUBLIC || type === ChannelType.PRIVATE)) {
            throw new HttpError(400, `Channel type ${type} is not valid from api call`);
        }
        console.log(channelName);
        if (fromApi && (channelName.startsWith('#') || channelName.startsWith('@'))) {
            throw new HttpError(400, `Channel name ${channelName} is not valid name`);
        }
        if (ChannelType.SQUEALER == type && ownerUser.role !== UserRoles.MODERATOR) {
            throw new HttpError(400, `User ${owner} is not authorized to create a squealer channel`);
        }

        if (type === ChannelType.SQUEALER) {
            channelName = channelName.toUpperCase();
        } else {
            channelName = channelName.toLowerCase();
        }

        if ((await ChannelModel.findOne({ name: channelName })) !== null) {
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

    public async joinChannel(
        channelName: string,
        username: string,
        permission: PermissionType,
        fromApi: boolean,
    ): Promise<ChannelResponse> {
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
            channel.users.push({ user: username, privilege: permission, notification: true });
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

    public async addMember(
        channel: string,
        userToAdd: string,
        userIssuer: string,
        permission: PermissionType,
    ): Promise<string> {
        // Maybe si può fare un refacor e al posto di mettere le invitation nell'array dei messaggi
        // si può mettere in un array a parte nello user
        const toAdd = await UserModel.findOne({ username: userToAdd });
        const issuer = await UserModel.findOne({ username: userIssuer });
        if (toAdd == null) {
            throw new HttpError(400, `User with username ${userToAdd} not exist`);
        }
        if (issuer == null) {
            throw new HttpError(400, `User with username ${userIssuer} not exist`);
        }

        const channelObj = await ChannelModel.findOne({ name: channel });

        if (channelObj == null) {
            throw new HttpError(400, 'channel not found');
        }
        const permissionIssuer = channelObj.users.find((user) => user.user == userIssuer)?.privilege;
        if (permissionIssuer === null || permissionIssuer !== PermissionType.ADMIN) {
            throw new HttpError(403, "Don't have the right to do this operation");
        }
        if (channelObj.users.find((user) => user.user == userToAdd) !== undefined) {
            throw new HttpError(400, 'User already in the channel');
        }
        const messages = await Promise.all(toAdd.messages.map((m) => MessageModel.findById(m.message)));
        const pendingRequest =
            messages.filter(
                (m) =>
                    m !== null && m.content.type === 'invitation' && (m.content.data as Invitation).channel === channel,
            ).length > 0;
        if (pendingRequest) {
            throw new HttpError(400, 'User already invited');
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
            category: ICategory.NORMAL,
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
        return userToAdd;
    }

    public async deleteInviteMessage(messageId: string): Promise<Invitation> {
        const message = await MessageModel.findById(messageId);
        if (message == null) {
            throw new HttpError(400, 'message not found');
        }
        const content = message.content.data as Invitation;
        await message.deleteOne();
        const user = await UserModel.findOne({ username: content.to });
        if (user == null) {
            throw new HttpError(400, 'user not found');
        }
        user.messages = user.messages.filter((m) => m.message._id.toString() !== messageId);
        user.markModified('messages');
        await user.save();
        return content;
    }

    public async setPermission(
        admin: string,
        channelName: string,
        user: string,
        newPermission: PermissionType,
    ): Promise<PermissionType> {
        const channel = await ChannelModel.findOne({ name: channelName });
        if (channel == null) {
            throw new HttpError(400, 'channel not found');
        }
        const userRecord = await UserModel.findOne({ username: user });
        if (userRecord == null) {
            throw new HttpError(400, 'user not found');
        }
        const adminRow = channel.users.find((u) => u.user == admin);
        if (adminRow == null || adminRow.privilege !== PermissionType.ADMIN) {
            throw new HttpError(403, "Don't have the right to do this operation");
        }

        const userRow = channel.users.find((u) => u.user == userRecord.name);
        if (userRow == null) {
            throw new HttpError(400, 'user not found');
        }
        userRow.privilege = newPermission;
        channel.markModified('users');
        await channel.save();
        return newPermission;
    }
}
