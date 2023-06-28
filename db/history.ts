import mongoose from 'mongoose';
import { type IHistory } from '@model/history';

export const HistoryModelName = 'History';

const HistorySchema = new mongoose.Schema<IHistory>({
    username: { type: String, required: true, unique: true },
    values: { type: [Object], required: true },
});

export default mongoose.model<IHistory>(HistoryModelName, HistorySchema);
