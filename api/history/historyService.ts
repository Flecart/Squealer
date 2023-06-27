import { HistoryPoint, HistoryUpdateType, type IHistory } from '@model/history';
import HistoryModel from '@db/history';
import MessageModel from '@db/message';
import { HydratedDocument } from 'mongoose';
import { HttpError } from '@model/error';
/**
 * RegExp to test a string for a ISO 8601 Date spec
 *  YYYY
 *  YYYY-MM
 *  YYYY-MM-DD
 *  YYYY-MM-DDThh:mmTZD
 *  YYYY-MM-DDThh:mm:ssTZD
 *  YYYY-MM-DDThh:mm:ss.sTZD
 * @see: https://www.w3.org/TR/NOTE-datetime
 * @type {RegExp}
 */
const ISO_8601 = /^\d{4}(-\d\d(-\d\d(T\d\d:\d\d(:\d\d)?(\.\d+)?(([+-]\d\d:\d\d)|Z)?)?)?)?$/i;

export class HistoryService {
    public async getHistory(username: string, from: string, to: string): Promise<HistoryPoint[]> {
        const history: HydratedDocument<IHistory> | null = await HistoryModel.findOne({ username: username });
        if (history === null) {
            return [];
        }
        // check if both strings are in the correct format
        if (!ISO_8601.test(from)) {
            throw new HttpError(400, "Invalid 'from' date format");
        }

        if (!ISO_8601.test(to)) {
            throw new HttpError(400, "Invalid 'to' date format");
        }

        const fromDate = new Date(from);
        const toDate = new Date(to);

        return history.values.filter((value) => {
            return value.date >= fromDate && value.date <= toDate;
        });
    }

    public async updateHistory(username: string): Promise<{ msg: string }> {
        let history: HydratedDocument<IHistory> | null = await HistoryModel.findOne({ username: username });
        if (history === null) {
            history = new HistoryModel({
                username: username,
                values: [],
            });
        }

        let historyPoint = new HistoryPoint();

        const updateMessages = await MessageModel.find(
            { creator: username, $where: 'this.historyUpdates.length > 0' },
            { historyUpdates: 1 },
        );
        updateMessages.forEach((message) => {
            message.historyUpdates.forEach((update) => {
                switch (update.type) {
                    case HistoryUpdateType.POPULARITY:
                        historyPoint.popularity += update.value;
                        break;
                    case HistoryUpdateType.REPLY:
                        historyPoint.reply += update.value;
                        break;
                    case HistoryUpdateType.POST:
                        historyPoint.post += update.value;
                        break;
                }
            });
        });

        history.values.push(historyPoint);
        history.markModified('values');
        await history.save();
        return { msg: 'History updated' };
    }
}
