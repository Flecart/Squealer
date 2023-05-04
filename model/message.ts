import mongoose from 'mongoose';
import { UserModelName } from './user';

/** 
Commento per le api
*/
export type Maps = string;

/** 
Commento per le api
*/
export type Img = string;

/** 
Commento per le api
*/
export interface IMessage {
    _id: mongoose.Types.ObjectId;
    channel: string; // il canale a cui appartiene il messaggio
    parent?: mongoose.Types.ObjectId; // il messaggio a cui risponde
    content: {
        type: string;
        data: string | Img | Maps;
    };
    children: mongoose.Types.ObjectId[];
    creator: string;
    date: Date;
    views: number; // impressions.

    // si tengono tutti gli utenti che fanno fatto queste reactions su questo messaggio.
    posReaction: mongoose.Types.ObjectId[];
    negReaction: mongoose.Types.ObjectId[];
}

export interface MessageCreation {
    channel: string; // il canale a cui appartiene il messaggio
    parent?: string; // il messaggio a cui risponde
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
    children: { type: [mongoose.Types.ObjectId], require: true, ref: MessageModelName },
    views: { type: Number, required: true },
    parent: { type: mongoose.Types.ObjectId, ref: MessageModelName },
    posReaction: { type: [mongoose.Types.ObjectId], required: true, ref: UserModelName },
    negReaction: { type: [mongoose.Types.ObjectId], required: true, ref: UserModelName },
});

export default mongoose.model<IMessage>(MessageModelName, MessageSchema);

export interface MessageCreationRensponse {
    id: string;
    channel: string;
}
