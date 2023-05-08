import * as mongoose from 'mongoose';
import { IQuotas } from '@model/quota';

export const QutasSchema = new mongoose.Schema<IQuotas>({
    day: { type: Number, required: true },
    month: { type: Number, required: true },
    week: { type: Number, required: true },
});
