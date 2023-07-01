import { ISmmRequest } from '@model/smmRequest';
import mongoose from 'mongoose';

export const SmmRequestSchema = new mongoose.Schema<ISmmRequest>({
    from: { type: String, required: true },
    to: { type: String, required: true },
});

export default mongoose.model<ISmmRequest>('smmRequest', SmmRequestSchema);
