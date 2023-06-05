import mongoose from 'mongoose';
import { PermissionType } from './channel';

/** 
Commento per le api
*/
export type Maps = string;

/** 
Commento per le api
*/
export type Img = Express.Multer.File;

export type Invitation = { to: string; channel: string; permission: PermissionType };

type SupportedContent = 'text' | 'image' | 'video' | 'maps' | 'invitation';

/** 
Commento per le api
*/
export interface IMessage {
    _id: mongoose.Types.ObjectId;
    channel: string; // il canale a cui appartiene il messaggio
    parent?: mongoose.Types.ObjectId; // il messaggio a cui risponde
    content: {
        type: SupportedContent;
        data: string | Img | Maps | Invitation;
    };
    children: mongoose.Types.ObjectId[];
    creator: string;
    date: Date;
    views: number; // impressions.
    reaction: IReaction[];
}

export enum IReactionType {
    ANGRY = -2,
    DISLIKE = -1,
    LIKE = 1,
    LOVE = 2,
    UNSET = 0,
}

export interface IReaction {
    id: string;
    type: IReactionType;
}

export interface MessageCreation {
    channel: string | undefined; // il canale a cui appartiene il messaggio
    parent: string | undefined; // il messaggio a cui risponde
    content: {
        type: SupportedContent;
        data: string | Img | Maps;
    };
}

export const MessageModelName = 'Message';

export interface MessageCreationRensponse {
    id: string;
    channel: string;
}
