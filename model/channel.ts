import mongoose from 'mongoose';
import { IMessage } from './message';
import { UserModelName } from './user';

type readPermType = 1;
type writePermType = 2;
export type permissionType = writePermType | readPermType;
export const readPermission: permissionType = 1;
export const writePermission: permissionType = 2;

export type channelType = 'user' | 'owned' | 'squealer' | 'public';

export function isSingleOwnerChannel(channel: IChannel): boolean {
    return channel.members.type === 'user' || channel.members.type === 'public';
}

export function isMultiOwnerChannel(channel: IChannel): boolean {
    return !isSingleOwnerChannel(channel);
}

// user e public sono userchannels, altri sono ownedchannels
export interface IChannel {
    name: string;
    description: string;
    type: channelType;
    owner: mongoose.Schema.Types.ObjectId;
    users: {
        user: mongoose.Schema.Types.ObjectId[];
        privilage: number;
    };
    messages: IMessage; // TODO: create tipo per i messaggi, che mettiamo qui
}

const ChannelSchema = new mongoose.Schema<IChannel>({
    name: { type: String, required: true },
    description: { type: String, required: false },
    messages: { type: [String], required: true },
    type: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: UserModelName, required: true },
    users: {
        user: [{ type: mongoose.Schema.Types.ObjectId, ref: UserModelName, required: true }],
        privilage: { type: Number, required: true },
    },
});

export default mongoose.model<IChannel>('Channel', ChannelSchema);
