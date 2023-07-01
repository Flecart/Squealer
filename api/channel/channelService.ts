import { HttpError } from '@model/error';
import { IChannel, ChannelType, PermissionType, ChannelResponse, sortChannel, isPublicChannel } from '@model/channel';
import ChannelModel from '@db/channel';
import MessageModel from '@db/message';
import InvitationModel from '@db/invitation';
import UserModel from '@db/user';
import { UserRoles } from '@model/user';
import { HydratedDocument } from 'mongoose';
import { type IInvitation } from '@model/invitation';
import { IMessage, MessageSortTypes, messageSort } from '@model/message';

export class ChannelService {
    public async getChannels(channelIds: string[], user: string): Promise<IChannel[]> {
        const channels = await ChannelModel.find({ _id: { $in: channelIds } });

        return channels.filter((channel) => {
            if (isPublicChannel(channel)) {
                return true;
            }
            if (channel.type === ChannelType.PRIVATE && channel.users.find((u) => u.user === user) != null) {
                return true;
            }
            return false;
        });
    }

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
            throw new HttpError(404, `Channel with name ${channelName} does not exist`);
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
    ): Promise<HydratedDocument<IChannel>> {
        let fromApi = isFromApi ?? false;
        const ownerUser = await UserModel.findOne({ username: owner });

        if (ownerUser === null) {
            throw new HttpError(400, `User with username ${owner} does not exist`);
        }

        // TODO: (low priority) è difficile capire la logica di questa funzione
        // perché ha il doppio stato fromApi o meno, e non dovrebbe essere così.

        if (!fromApi && !(type === ChannelType.USER)) {
            // TODO(gio): aggingere il check descritto nei commenti della PR #138
            throw new HttpError(400, `Channel type ${type} is not valid from api call`);
        }
        if (fromApi && (channelName.startsWith('#') || channelName.startsWith('@') || channelName.startsWith('§'))) {
            throw new HttpError(400, `Channel name ${channelName} is not valid name can't start with @ or # or §`);
        }
        if (ChannelType.SQUEALER == type && ownerUser.role !== UserRoles.MODERATOR) {
            throw new HttpError(400, `User ${owner} is not authorized to create a squealer channel`);
        }

        if (type === ChannelType.SQUEALER) {
            channelName = channelName.toUpperCase();
        } else {
            channelName = channelName.toLowerCase();
        }

        const publicChannelRegex = /^[#§]?[a-zA-Z0-9_]+$/g; // eg. #channel1, §channel2, channel3, CHANNEL
        const userChannelRegex = /^@[a-z0-9_]+-[a-z0-9_]+$/g; // eg. @user1-user2 @us_1-us_2

        if ((await ChannelModel.findOne({ name: channelName })) !== null) {
            throw new HttpError(400, 'Channel name already exists');
        } else if (channelName.length > 30) {
            throw new HttpError(400, 'Channel name is too long');
        } else if (channelName.length < 3) {
            throw new HttpError(400, 'Channel name is too short, minimum 3 characters');
        } else if (channelName.match(publicChannelRegex) === null && type !== ChannelType.USER) {
            throw new HttpError(400, 'Channel name can only contain alphanumeric characters and begin with a #§');
        } else if (channelName.match(userChannelRegex) === null && type === ChannelType.USER) {
            throw new HttpError(400, 'Channel name format not satisfied with user type');
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
        await channel.save();
        return channel;
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
        if (!toAdd) {
            throw new HttpError(400, `User with username ${userToAdd} not exist`);
        }
        if (!issuer) {
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

        const _invitation = await InvitationModel.findOne({ to: userToAdd, channel: channelObj.name });
        if (_invitation !== null) {
            throw new HttpError(400, 'User already invited');
        }
        const invitation = new InvitationModel({
            to: userToAdd,
            issuer: userIssuer,
            channel: channelObj.name,
            permission: permission,
        });

        await invitation.save();
        toAdd.invitations.push(invitation._id);
        toAdd.markModified('invitations');
        await toAdd.save();
        return userToAdd;
    }

    public async deleteInviteMessage(userId: string, messageId: string): Promise<IInvitation> {
        const user = await UserModel.findOne({ username: userId });
        if (user === null) {
            throw new HttpError(400, `User with username ${userId} not exist`);
        }
        if (user.invitations.find((e) => e.toString() === messageId) == undefined) {
            throw new HttpError(400, `Invite with id ${messageId} not exist`);
        }
        const invitation = await InvitationModel.findByIdAndDelete(messageId);
        if (invitation === null) {
            throw new HttpError(400, `Message with id ${messageId} not exist`);
        }
        user.invitations = user.invitations.filter((e) => e.toString() !== messageId);
        await user.save();
        return invitation;
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

        const userRow = channel.users.find((u) => u.user == userRecord.username);
        if (userRow == null) {
            throw new HttpError(400, 'user not found');
        }
        userRow.privilege = newPermission;
        channel.markModified('users');
        await channel.save();
        return newPermission;
    }
    public async getMessageIds(
        channelName: string,
        user: string | null,
        sort: MessageSortTypes | undefined,
    ): Promise<string[]> {
        const temp = await this.getChannel(channelName, user);
        let messages = await MessageModel.find({ _id: { $in: temp.messages } });
        if (sort) {
            const customSort = (a: IMessage, b: IMessage) => messageSort(a, b, sort);
            messages = messages.sort(customSort);
        }
        return messages.map((m) => m._id.toString());
    }
}
