import type mongoose from 'mongoose';

export enum PermissionType {
    READ = 'read',
    WRITE = 'write',
    READWRITE = 'readwrite',
    ADMIN = 'owner',
}

export enum ChannelType {
    USER = 1,
    PUBLIC = 2,
    HASHTAG = 3,
    PRIVATE = 4,
    SQUEALER = 5,
}

export function isPublicChannel(channel: IChannel): boolean {
    return (
        channel.type === ChannelType.PUBLIC ||
        channel.type === ChannelType.HASHTAG ||
        channel.type === ChannelType.SQUEALER
    );
}

// user e public sono userchannels, altri sono ownedchannels
export interface IChannel {
    name: string;
    description: string;
    type: ChannelType;
    users: {
        user: string;
        privilege: PermissionType;
        notification: boolean;
    }[];
    messages: mongoose.Types.ObjectId[]; // TODO: create tipo per i messaggi, che mettiamo qui
}

export interface ChannelInfo {
    channelName: string;
    type: ChannelType;
    description?: string;
}

export interface ChannelDescription {
    description: string;
}

export interface ChannelResponse {
    message: string;
    channel: string;
}
