import mongoose from 'mongoose';
import { UserModelName } from './user';

/** 
Commento per le api
*/
export type Maps = string;

/** 
Commento per le api
*/
export type Img = Express.Multer.File;

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

    // si tengono tutti gli username di utenti che fanno fatto queste reactions su questo messaggio.
    posReaction: string[];
    negReaction: string[];
}

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
    children: { type: [mongoose.Types.ObjectId], require: true, ref: MessageModelName },
    views: { type: Number, required: true },
    parent: { type: mongoose.Types.ObjectId, ref: MessageModelName },
    posReaction: { type: [String], required: true, ref: UserModelName },
    negReaction: { type: [String], required: true, ref: UserModelName },
});

export default mongoose.model<IMessage>(MessageModelName, MessageSchema);

export interface MessageCreationRensponse {
    id: string;
    channel: string;
}
