import type mongoose from 'mongoose';
import type { PermissionType } from './channel';
/** 
Commento per le api
*/
export type Img = Express.Multer.File;

/** 
Commento per le api
*/

export interface MapPosition {
    lat: number;
    lng: number;
}
export interface Maps {
    positions: MapPosition[];
}

export type Invitation = { to: string; channel: string; permission: PermissionType };

export type SupportedContent = 'text' | 'image' | 'video' | 'maps' | 'invitation';

export const CriticMass = 1;

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
    category: ICategory;
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

export function sortRecently(a: IMessage, b: IMessage): number {
    if (a.date > b.date) return -1;
    if (a.date < b.date) return 1;
    return 0;
}

export function sortHighliths(a: IMessage, b: IMessage): number {
    const mapReactionToNumber = new Map<IReactionType, number>();
    mapReactionToNumber.set(IReactionType.ANGRY, -2);
    mapReactionToNumber.set(IReactionType.DISLIKE, -1);
    mapReactionToNumber.set(IReactionType.UNSET, 0);
    mapReactionToNumber.set(IReactionType.LIKE, 1);
    mapReactionToNumber.set(IReactionType.LOVE, 3);
    const toNumber = (reaction: IReaction): number => mapReactionToNumber.get(reaction.type) ?? 0;
    const na = a.reaction.map(toNumber).reduce((a, b) => a + b, 0);
    const nb = b.reaction.map(toNumber).reduce((a, b) => a + b, 0);
    return na - nb;
}
