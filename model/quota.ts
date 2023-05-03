import * as mongoose from 'mongoose';

export interface IQuotas {
    day: number;
    month: number;
    week: number;
}

export const QutasSchema = new mongoose.Schema<IQuotas>({
    day: { type: Number, required: true },
    month: { type: Number, required: true },
    week: { type: Number, required: true },
});
