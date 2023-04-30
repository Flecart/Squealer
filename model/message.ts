import mongoose from 'mongoose';
import { UserAuthModelName } from './auth';

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
    destination: string;
    content: {
        type: string;
        data: string | Img | Maps;
    };
    creator: mongoose.Types.ObjectId;
    date: Date;
    views: number;
    posReaction: number;
    negReaction: number;
}

const MessageSchema = new mongoose.Schema<IMessage>({
    destination: { type: String, required: true },
    creator: { type: mongoose.Schema.Types.ObjectId, required: true, ref: UserAuthModelName },
    content: { type: Object, required: true },
    date: { type: Date, required: true },
    views: { type: Number, required: true },
    posReaction: { type: Number, required: true },
    negReaction: { type: Number, required: true },
});

export default mongoose.model<IMessage>('Messages', MessageSchema);
