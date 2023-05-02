import mongoose from 'mongoose';
import { UserAuthModelName } from './auth';
import { UserModelName } from './user';
import { IQuotas } from './quota';

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
    used_quota: IQuotas;
    max_quota: IQuotas;
    posReaction: mongoose.Types.ObjectId[];
    negReaction: mongoose.Types.ObjectId[];
}

export const MessageSchema = new mongoose.Schema<IMessage>({
    destination: { type: String, required: true },
    creator: { type: mongoose.Schema.Types.ObjectId, required: true, ref: UserAuthModelName },
    content: { type: Object, required: true },
    date: { type: Date, required: true },
    views: { type: Number, required: true },
    used_quota: { type: Object, required: true },
    max_quota: { type: Object, required: true },
    posReaction: { type: [mongoose.Types.ObjectId], required: true, ref: UserModelName },
    negReaction: { type: [mongoose.Types.ObjectId], required: true, ref: UserModelName },
});

export const MessageModelName = 'Message';

export default mongoose.model<IMessage>(MessageModelName, MessageSchema);
