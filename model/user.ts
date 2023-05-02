import mongoose from 'mongoose';

export const UserModelName = 'User';

export interface IMessageInbox {
    message: mongoose.Types.ObjectId;
    channel: mongoose.Types.ObjectId;
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
    day_quote: number;
    month_quote: number;
    week_quote: number;
    clients?: string[];
    messages: [IMessageInbox];
}

const UserSchema = new mongoose.Schema<IUser>({
    name: { type: String, required: true },
    username: { type: String, required: true },
    profile_pic: { type: String, required: true },
    channels: { type: [String], required: true },
    day_quote: { type: Number, required: true },
    month_quote: { type: Number, required: true },
    week_quote: { type: Number, required: true },
    clients: { type: [String], required: false },
    messages: { type: [MessageInboxSchema], required: true },
});

// https://www.dicebear.com/how-to-use/js-library

export default mongoose.model<IUser>(UserModelName, UserSchema);
