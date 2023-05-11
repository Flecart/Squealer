import { IMessage } from '@model/message';
import MessageModel from '@db/message';

export class FeedService {
    // Remember to update always the views
    public async getMessages(): Promise<IMessage[]> {
        return await MessageModel.find();
    }
}
