// viene specificato il tipo di update, in modo che poi si possa aggiornare
// il db che contiene la history in modo corretto.
export enum HistoryUpdateType {
    POPULARITY = 0,
    REPLY = 1,
    POST = 2,
}

export type UnionHistoryUpdateTypes = HistoryUpdateType.POPULARITY | HistoryUpdateType.REPLY | HistoryUpdateType.POST;

export interface HistoryUpdate {
    type: UnionHistoryUpdateTypes;
    value: number;
}

// represents a point in the history of user metric
export class HistoryPoint {
    popularity: number;
    reply: number;
    post: number;
    date: Date;

    constructor() {
        this.popularity = 0;
        this.reply = 0;
        this.post = 0;
        this.date = new Date();
    }
}

export interface IHistory {
    username: string;
    values: HistoryPoint[];
}
