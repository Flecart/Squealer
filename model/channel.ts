import mongoose from 'mongoose';
import { MessageModelName } from './message';

type readPermType = 1;
type writePermType = 2;
export type permissionType = writePermType | readPermType;
export const readPermission: permissionType = 1;
export const writePermission: permissionType = 2;

export type channelType = 'user' | 'owned' | 'squealer' | 'public';

export function isSingleOwnerChannel(channel: IChannel): boolean {
    return channel.type == 'user' || channel.type == 'public';
}

export function isMultiOwnerChannel(channel: IChannel): boolean {
    return !isSingleOwnerChannel(channel);
}

// user e public sono userchannels, altri sono ownedchannels
export interface IChannel {
    name: string;
    description: string;
    type: channelType;
    owner: string;
    users: {
        user: string;
        privilege: permissionType;
    }[];
    messages: mongoose.Types.ObjectId[]; // TODO: create tipo per i messaggi, che mettiamo qui
}

const ChannelSchema = new mongoose.Schema<IChannel>({
    name: { type: String, required: true },
    description: { type: String, required: false },
    messages: { type: [mongoose.Types.ObjectId], required: true, ref: MessageModelName },
    type: { type: String, required: true },
    owner: { type: String, required: true },
    users: [
        {
            user: { type: String, required: true },
            privilege: { type: Number, required: true },
        },
    ],
});

export const ChannelModelName = 'Channel';

export default mongoose.model<IChannel>(ChannelModelName, ChannelSchema);
