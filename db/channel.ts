import mongoose from 'mongoose';
import { MessageModelName } from './message';
import { IChannel } from '@model/channel';

export function getUserChannelName(user1: string, user2: string): string {
    return user1 < user2 ? `@${user1}-${user2}` : `@${user2}-${user1}`;
}

const ChannelSchema = new mongoose.Schema<IChannel>({
    name: { type: String, required: true },
    description: { type: String, required: false },
    messages: { type: [mongoose.Types.ObjectId], required: true, ref: MessageModelName },
    type: { type: String, required: true },
    users: [
        {
            user: { type: String, required: true },
            privilege: { type: String, required: true },
            notification: { type: Boolean, required: true },
        },
    ],
});

export const ChannelModelName = 'Channel';

export default mongoose.model<IChannel>(ChannelModelName, ChannelSchema);
