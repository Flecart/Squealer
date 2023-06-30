// viene specificato il tipo di update, in modo che poi si possa aggiornare
// il db che contiene la history in modo corretto.
export enum HistoryUpdateType {
    POPULARITY = 0,
    REPLY = 1,
    POST = 2,
}

export interface HistoryUpdate {
    type: HistoryUpdateType;
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

    addUpdate(update: HistoryUpdate) {
        switch (update.type) {
            case HistoryUpdateType.POPULARITY:
                this.popularity += update.value;
                break;
            case HistoryUpdateType.REPLY:
                this.reply += update.value;
                break;
            case HistoryUpdateType.POST:
                this.post += update.value;
                break;
        }
    }

    add(historyPoint: HistoryPoint) {
        this.popularity += historyPoint.popularity;
        this.reply += historyPoint.reply;
        this.post += historyPoint.post;
    }
}

export interface IHistory {
    username: string;
    values: HistoryPoint[];
}
