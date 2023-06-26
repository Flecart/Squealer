import type mongoose from 'mongoose';
import { type IQuotas, quotaMaxExtra } from './quota';
import type { IUserAuth } from './auth';

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
    debtQuota: number;
    clients?: string[];
    messages: IMessageInbox[];
    channel: string[];
    role: UserRoles;
    invitations: mongoose.Types.ObjectId[];
}

export function haveEnoughtQuota(user: IUser, lenChar: number): boolean {
    return (
        (user.usedQuota.day + lenChar < user.maxQuota.day &&
            user.usedQuota.week + lenChar < user.maxQuota.week &&
            user.usedQuota.month + lenChar < user.maxQuota.month) ||
        (getExtraQuota(user, lenChar) >= 0 &&
            user.usedQuota.day < user.maxQuota.day &&
            user.usedQuota.week < user.maxQuota.week &&
            user.usedQuota.month < user.maxQuota.month)
    );
}

export function getExtraQuota(user: IUser, quota: number): number {
    let extraQuota: IQuotas = {
        day: user.usedQuota.day + quota - user.maxQuota.day,
        week: user.usedQuota.week + quota - user.maxQuota.week,
        month: user.usedQuota.month + quota - user.maxQuota.month,
    };

    if (extraQuota.day < 0) {
        extraQuota.day = 0;
    }
    if (extraQuota.week < 0) {
        extraQuota.week = 0;
    }
    if (extraQuota.month < 0) {
        extraQuota.month = 0;
    }

    return quotaMaxExtra - (extraQuota.day + extraQuota.week + extraQuota.month);
}

export interface ISuccessMessage {
    message: string;
}

export type UserModRensponse = IUser & Pick<IUserAuth, 'suspended'>;

export interface NotificationRensponse {
    message: string[];
    invitation: string[];
}
