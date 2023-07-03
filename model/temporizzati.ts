import type * as mongoose from 'mongoose';
import type { Img, Maps, SupportedContent } from '@model/message';

export type TempSupportedContent = SupportedContent | 'wikipedia';

export interface ITemporizzati {
    _id: mongoose.Types.ObjectId;
    creator: string;
    channel: string;
    content: {
        type: TempSupportedContent;
        data: string | Img | Maps;
    };
    iterazioni: number;
    periodo: number;
    running: boolean;
}

export type ContentInput = {
    channel: string;
    content: {
        type: TempSupportedContent;
        data: string;
    };
    iterazioni: number;
    periodo: number;
};
