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

export interface IUserChannel {
    type: 'user' | 'public';
    ownerRef: mongoose.Types.ObjectId;
}

export const UserChannelScheme = new mongoose.Schema<IUserChannel>({
    type: { type: String, required: true },
    ownerRef: { type: mongoose.Schema.Types.ObjectId, required: true, ref: UserModelName },
});

export interface IOwnedChannel {
    type: 'owned' | 'squealer';
    ownerRef: mongoose.Types.ObjectId[];
    users: [
        {
            userRef: mongoose.Types.ObjectId;
            permission: permissionType;
        },
    ];
    admins: mongoose.Types.ObjectId[];
}

export const OwnedChannelScheme = new mongoose.Schema<IOwnedChannel>({
    type: { type: String, required: true },
    ownerRef: { type: [mongoose.Schema.Types.ObjectId], required: true, ref: UserModelName },
    users: {
        type: [
            {
                userRef: { type: mongoose.Schema.Types.ObjectId, required: true, ref: UserModelName },
                permission: { type: Number, required: true },
            },
        ],
        required: true,
    },
    admins: { type: [mongoose.Schema.Types.ObjectId], required: true, ref: UserModelName },
});

// user e public sono userchannels, altri sono ownedchannels
export interface IChannel {
    name: string;
    description: string;
    members: IUserChannel | IOwnedChannel; // tutti i dati relativi alle persone nel canale
    messages: IMessage; // TODO: create tipo per i messaggi, che mettiamo qui
}

const ChannelSchema = new mongoose.Schema<IChannel>({
    name: { type: String, required: true },
    description: { type: String, required: false },
    members: { type: Object, required: true }, // TODO: add validations for the object
    messages: { type: [String], required: true },
});

export default mongoose.model<IChannel>('Channel', ChannelSchema);
