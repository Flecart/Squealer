import mongoose from 'mongoose';
import { Img } from '@model/message';
import { Maps } from '@model/message';
import { IReaction } from '@model/message';
import { IMessage } from '@model/message';
import { HistoryUpdateType } from '@model/history';

const IReactionSchema = new mongoose.Schema<IReaction>({
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
    channel: { type: String, required: false },
    content: { type: Object, required: true },
    date: { type: Date, required: true },
    children: { type: [mongoose.Types.ObjectId], require: true },
    views: { type: Number, required: true },
    parent: { type: mongoose.Types.ObjectId, ref: MessageModelName },
    reaction: { type: [IReactionSchema], required: true },
    category: { type: Number, required: true },
    historyUpdates: {
        type: [Object],
        required: true,
        default: [
            {
                type: HistoryUpdateType.POST,
                value: 1, // quando creo un nuovo messaggio, c'è sempre da gestire l'evento che è stato creato un nuovo post.
            },
        ],
    },
});

export default mongoose.model<IMessage>(MessageModelName, MessageSchema);
