import { IMessage } from '@model/message';
import MessageModel from '@db/message';

export class FeedService {
    public async getMessages(): Promise<IMessage[]> {
        return await MessageModel.find();
    }
}
