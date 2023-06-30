import type mongoose from 'mongoose';
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

export type SupportedContent = 'text' | 'image' | 'video' | 'maps';

export const CriticMass = 2;

export const DefaultPageSize = 10;

export type MessageSortTypes =
    | 'reactions-desc'
    | 'reactions-asc'
    | 'popularity'
    | 'risk'
    | 'unpopularity'
    | 'recent-asc'
    | 'recent-desc';

export function messageSort(a: IMessage, b: IMessage, type: MessageSortTypes): number {
    switch (type) {
        case 'recent-asc':
            return sortMostRecent(a, b);
        case 'recent-desc':
            return -sortMostRecent(a, b);
        case 'reactions-desc':
            return -sortReactionsAsc(a, b);
        case 'reactions-asc':
            return sortReactionsAsc(a, b);
        case 'popularity':
            return sortPopularity(a, b);
        case 'unpopularity':
            return -sortPopularity(a, b);
        case 'risk':
            return sortRisk(a, b);
        default:
            return 0;
    }
}

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
}

export interface IMessageWithPages {
    messages: IMessage[];
    pages: number;
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

export function sortMostRecent(a: IMessage, b: IMessage): number {
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

function sortPopularity(a: IMessage, b: IMessage): number {
    const aReactions = a.reaction.reduce((acc, curr) => acc + curr.type, 0);
    const bReactions = b.reaction.reduce((acc, curr) => acc + curr.type, 0);
    return aReactions - bReactions;
}

function sortReactionsAsc(a: IMessage, b: IMessage): number {
    const aNumReactions = a.reaction.length;
    const bNumReactions = b.reaction.length;
    return aNumReactions - bNumReactions;
}

// se è più vicino a diventare controverso o unpopolare, allora è più rischioso
function sortRisk(a: IMessage, b: IMessage): number {
    const aPositive = a.reaction.filter((reaction) => reaction.type > 0).reduce((acc, curr) => acc + curr.type, 0);
    const aNegative = a.reaction.filter((reaction) => reaction.type < 0).reduce((acc, curr) => acc + curr.type, 0);

    const bPositive = b.reaction.filter((reaction) => reaction.type > 0).reduce((acc, curr) => acc + curr.type, 0);
    const bNegative = b.reaction.filter((reaction) => reaction.type < 0).reduce((acc, curr) => acc + curr.type, 0);

    const isControversial = (positive: number, negative: number) =>
        Math.abs(positive) > CriticMass && Math.abs(negative) > CriticMass;
    const controversialCount = (positive: number, negative: number): number => {
        let controversialValue = 0;
        if (!isControversial(positive, negative)) {
            controversialValue += Math.abs(positive) > CriticMass ? 0 : CriticMass - Math.abs(positive);
            controversialValue += Math.abs(negative) > CriticMass ? 0 : CriticMass - Math.abs(negative);
        }

        return controversialValue;
    };
    const negativeCount = (negative: number): number => {
        let negativeValue = 0;
        if (Math.abs(negative) < CriticMass) {
            negativeValue += CriticMass - Math.abs(negative);
        }
        return negativeValue;
    };
    // provo a misurare quanto mi manca per diventare controverso.
    const aControversial = controversialCount(aPositive, aNegative);
    const bControversial = controversialCount(bPositive, bNegative);
    const aNegativeCount = negativeCount(aNegative);
    const bNegativeCount = negativeCount(bNegative);

    // a < b solo se ha un conteggio minore di b
    return aControversial + aNegativeCount - (bControversial + bNegativeCount);
}
