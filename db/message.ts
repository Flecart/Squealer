import mongoose from 'mongoose';
import { Img } from '@model/message';
import { Maps } from '@model/message';
import { Reaction } from '@model/message';
import { IMessage } from '@model/message';

const ReactionSchema = new mongoose.Schema<Reaction>({
    id: { type: String, required: true },
    type: { type: Number, required: true },
});

export interface MessageCreation {
    channel: string; // il canale a cui appartiene il messaggio
    parent: string | undefined; // il messaggio a cui risponde
    content: {
        type: string;
        data: string | Img | Maps;
    };
}

export const MessageModelName = 'Message';

export const MessageSchema = new mongoose.Schema<IMessage>({
    creator: { type: String, required: true },
    channel: { type: String, required: true },
    content: { type: Object, required: true },
    date: { type: Date, required: true },
    children: { type: [mongoose.Types.ObjectId], require: true },
    views: { type: Number, required: true },
    parent: { type: mongoose.Types.ObjectId, ref: MessageModelName },
    reaction: { type: [ReactionSchema], required: true },
});

export default mongoose.model<IMessage>(MessageModelName, MessageSchema);
