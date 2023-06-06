import * as mongoose from 'mongoose';
import { type Img, type Maps, type SupportedContent } from '@model/message';

export interface ITemporizzati {
    _id: mongoose.Types.ObjectId;
    creator: string;
    channel: string;
    data: string;
    content: string | Img | Maps;
    type: SupportedContent;
    iterazioni: number;
    periodo: number;
    running: boolean;
}
