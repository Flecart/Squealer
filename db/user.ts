import mongoose from 'mongoose';
import { IMessageInbox, IUser } from '@model/user';

export const UserModelName = 'User';

const MessageInboxSchema = new mongoose.Schema<IMessageInbox>({
    message: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Message' },
    viewed: { type: Boolean, required: true },
});

const UserSchema = new mongoose.Schema<IUser>({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    profile_pic: { type: String, required: true },
    channels: { type: [String], required: true },

    usedQuota: { type: Object, required: true },
    maxQuota: { type: Object, required: true },
    debtQuota: { type: Number, required: true },

    clients: { type: [String], required: false },
    messages: { type: [MessageInboxSchema], required: true },
    channel: { type: [String], required: true },
    role: { type: String, required: true },
    invitations: { type: [mongoose.Schema.Types.ObjectId], required: true },
});

export default mongoose.model<IUser>(UserModelName, UserSchema);
