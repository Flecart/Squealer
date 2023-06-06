import * as mongoose from 'mongoose';
import { type Img, type Maps, type SupportedContent } from '@model/message';

export interface ITemporizzati {
    _id: mongoose.Types.ObjectId;
    creator: string;
    channel: string;
    content: {
        type: SupportedContent | 'wikipedia';
        data: string | Img | Maps;
    };
    iterazioni: number;
    periodo: number;
    running: boolean;
}
