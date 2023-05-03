import { HttpError } from '@model/error';
import { ChannelResponse } from './channelController';
import ChannelModel, { IChannel } from '@model/channel';
import AuthModel from '@model/auth';
import { HydratedDocument } from 'mongoose';

export class ChannelService {
    public async create(channelName: string, owner: string, description?: string): Promise<ChannelResponse> {
        const ownerUser = await AuthModel.findOne({ username: owner });
        if (ownerUser === null) {
            throw new HttpError(400, `Owner with username ${owner} does not exist`);
        } else if (channelName !== channelName.toLowerCase()) {
            throw new HttpError(400, 'Channel name must be lowercase');
        } else if ((await ChannelModel.findOne({ name: channelName })) !== null) {
            throw new HttpError(400, 'Channel name already exists');
        }

        ChannelModel.create({
            name: channelName,
            description: description ?? '',
            type: 'user',
            members: {
                userRef: ownerUser.userId,
            },
            messages: [],
        });

        return { message: 'Channel created' };
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

        const ownerNames = await this.getOwnerNames(channel);
        if (ownerNames.indexOf(issuer_name) === -1) {
            throw new HttpError(400, `User ${issuer_name} is not an owner of channel ${channelName}`);
        }
        // TODO: check issuer name has rights to update description (e.g. admins)

        channel.description = description;
        await channel.save();

        return { message: `Channel description updated to ${description}` };
    }

    public async joinChannel(channelName: string, username: string): Promise<ChannelResponse> {
        return { message: `TODO: User ${username} joined channel ${channelName}` };
    }

    public async leaveChannel(channelName: string, username: string): Promise<ChannelResponse> {
        return { message: `TODO: User ${username} left channel ${channelName}` };
    }

    public async deleteChannel(channelName: string, username: string): Promise<ChannelResponse> {
        return { message: `TODO: User ${username} deleted channel ${channelName}` };
    }

    public async addOwner(channelName: string, username: string, _issuer: string): Promise<ChannelResponse> {
        return { message: `TODO: User ${username} added as owner of channel ${channelName}` };
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
