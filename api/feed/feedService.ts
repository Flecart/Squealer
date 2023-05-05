import MessageModel, { IMessage } from '@model/message';

export class FeedService {
    public async getMessages(): Promise<IMessage[]> {
        return await MessageModel.find();
    }
}
