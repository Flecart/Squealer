import type mongoose from 'mongoose';
import type { IQuotas } from './quota';
import { IUserAuth } from './auth';

export const UserModelName = 'User';

export interface IMessageInbox {
    message: mongoose.Types.ObjectId;
    viewed: boolean;
}

export enum UserRoles {
    NORMAL = 'normal',
    SMM = 'smm',
    VIP = 'vip',
    MODERATOR = 'moderator',
    VERIFIED = 'verified',
}

export interface IUser {
    name: string;
    username: string;
    profile_pic: string;
    channels: string[];
    usedQuota: IQuotas;
    maxQuota: IQuotas;
    clients?: string[];
    messages: IMessageInbox[];
    channel: string[];
    role: UserRoles;
}

export function haveEnoughtQuota(user: IUser, lenChar: number): boolean {
    return (
        user.usedQuota.day + lenChar < user.maxQuota.day &&
        user.usedQuota.week + lenChar < user.maxQuota.week &&
        user.usedQuota.month + lenChar < user.maxQuota.month
    );
}

export interface ISuccessMessage {
    message: string;
}

export type UserModRensponse = IUser & Pick<IUserAuth, 'suspended'>;
