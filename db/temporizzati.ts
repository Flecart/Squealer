import mongoose from 'mongoose';
import { type ITemporizzati } from '@model/temporizzati';

export const TemporizzatiModelName = 'Temporizzati';

const TemporizzatiSchema = new mongoose.Schema<ITemporizzati>({
    creator: { type: String, required: true },
    periodo: { type: Number, required: true },
    iterazioni: { type: Number, required: true },
    channel: { type: String, required: true },
    content: { type: Object, required: true },
    running: { type: Boolean, required: true },
});

export default mongoose.model<ITemporizzati>(TemporizzatiModelName, TemporizzatiSchema);
