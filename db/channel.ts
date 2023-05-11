import mongoose from 'mongoose';
import { MessageModelName } from './message';
import { IChannel } from '@model/channel';

const ChannelSchema = new mongoose.Schema<IChannel>({
    name: { type: String, required: true },
    description: { type: String, required: false },
    messages: { type: [mongoose.Types.ObjectId], required: true, ref: MessageModelName },
    type: { type: String, required: true },
    owner: { type: String, required: true },
    users: [
        {
            user: { type: String, required: true },
            privilege: { type: Number, required: true },
        },
    ],
});

export const ChannelModelName = 'Channel';

export default mongoose.model<IChannel>(ChannelModelName, ChannelSchema);
