import type mongoose from 'mongoose';

export enum PermissionType {
    READ = 'read',
    WRITE = 'write',
    READWRITE = 'readwrite',
    ADMIN = 'owner',
}

export function permissionToValue(permission: PermissionType): number {
    // questa funzione è fatta pensando ai gradi militari:
    // il numero successivo ha tutti i permessi del precedente.
    // questo invalida il significato del readwrite, perché write
    // avrebbe già il read, ma secondo me per una applicazione di chat
    // non ha senso avere il write senza lettura.
    switch (permission) {
        case PermissionType.READ:
            return 1;
        case PermissionType.WRITE:
            return 2;
        case PermissionType.READWRITE:
            return 3;
        case PermissionType.ADMIN:
            return 4;
    }
}

export enum ChannelType {
    USER = 'user',
    PUBLIC = 'public',
    HASHTAG = 'hashtag',
    PRIVATE = 'private',
    SQUEALER = 'squealer',
}

export function isPublicChannel(channel: IChannel): boolean {
    return (
        channel.type === ChannelType.PUBLIC ||
        channel.type === ChannelType.HASHTAG ||
        channel.type === ChannelType.SQUEALER
    );
}

export const channelCost: number = 2;

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

export function sortChannel(a: IChannel, b: IChannel): number {
    if (a.type === b.type) {
        return a.name.localeCompare(b.name);
    }
    const order: Map<ChannelType, number> = new Map([
        [ChannelType.USER, 0],
        [ChannelType.PRIVATE, 1],
        [ChannelType.PUBLIC, 2],
        [ChannelType.SQUEALER, 3],
    ]);
    const an = order.get(a.type);
    const bn = order.get(b.type);

    if (an === undefined) return 1;
    if (bn === undefined) return -1;
    return an - bn;
}

export function canUserWriteTochannel(channel: IChannel, user: string): boolean {
    const userChannel = channel.users.find((u) => u.user === user);
    if (!userChannel) return false;
    return permissionToValue(userChannel.privilege) >= permissionToValue(PermissionType.WRITE);
}

export enum ChannelSortBy {
    POSTS = 'npost',
    USER = 'nuser',
}

export type ISuggestion = string;
export const defaultSuggestionLimit = 5;
