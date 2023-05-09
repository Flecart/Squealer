import mongoose from 'mongoose';
import { IQuotas } from './quota';

export const UserModelName = 'User';

export interface IMessageInbox {
    message: mongoose.Types.ObjectId;
    viewed: boolean;
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
}

export function haveEnoughtQuota(user: IUser, lenChar: number): boolean {
    return (
        user.usedQuota.day + lenChar < user.maxQuota.day &&
        user.usedQuota.week + lenChar < user.maxQuota.week &&
        user.usedQuota.month + lenChar < user.maxQuota.month
    );
}
