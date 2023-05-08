import mongoose from 'mongoose';

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
    reaction: Reaction[];
}

export enum ReactionType {
    ANGRY = -2,
    DISLIKE = -1,
    LIKE = 1,
    LOVE = 2,
    UNSET = 0,
}

export interface Reaction {
    id: string;
    type: ReactionType;
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

export interface MessageCreationRensponse {
    id: string;
    channel: string;
}
