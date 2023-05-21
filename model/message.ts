import mongoose from 'mongoose';

/** 
Commento per le api
*/
export type Maps = string;

/** 
Commento per le api
*/
export type Img = Express.Multer.File;

type SupportedContent = 'text' | 'image' | 'video' | 'maps';

//Critic Mass
export const CM = 1;

/** 
Commento per le api
*/
export interface IMessage {
    _id: mongoose.Types.ObjectId;
    channel: string; // il canale a cui appartiene il messaggio
    parent?: mongoose.Types.ObjectId; // il messaggio a cui risponde
    content: {
        type: SupportedContent;
        data: string | Img | Maps;
    };
    children: mongoose.Types.ObjectId[];
    creator: string;
    date: Date;
    views: number; // impressions.
    reaction: IReaction[];
    category: ICategory;
    posR: number;
    negR: number;
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

export enum ICategory {
    NORMAL = 0,
    POPULAR = 1,
    CONTROVERSIAL = 2,
    UNPOPULAR = 3,
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

export interface ReactionResponse {
    reaction: IReactionType;
    category: number;
}
