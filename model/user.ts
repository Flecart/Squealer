import mongoose from 'mongoose';
import { IQuotas } from './quota';

export const UserModelName = 'User';

export interface IMessageInbox {
    message: mongoose.Types.ObjectId;
    viewed: boolean;
}

const MessageInboxSchema = new mongoose.Schema<IMessageInbox>({
    message: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Message' },
    viewed: { type: Boolean, required: true },
});

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
        user.usedQuota.day + lenChar > user.maxQuota.day &&
        user.usedQuota.week + lenChar > user.maxQuota.week &&
        user.usedQuota.month + lenChar > user.maxQuota.month
    );
}

const UserSchema = new mongoose.Schema<IUser>({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    profile_pic: { type: String, required: true },
    channels: { type: [String], required: true },

    usedQuota: { type: Object, required: true },
    maxQuota: { type: Object, required: true },

    clients: { type: [String], required: false },
    messages: { type: [MessageInboxSchema], required: true },
});

// https://www.dicebear.com/how-to-use/js-library

export default mongoose.model<IUser>(UserModelName, UserSchema);
