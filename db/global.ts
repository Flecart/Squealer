import mongoose from 'mongoose';
import { type IGlobal } from '@model/global';

const GlobalSchema = new mongoose.Schema<IGlobal>({
    lastUpdate: {
        type: Date,
        required: true,
    },
});

export default mongoose.model<IGlobal>('Global', GlobalSchema);
