import MessageModel, { Img, Maps } from '@model/message';

export class MessageService {
    public async create(destination: string, creator: string, content: { type: string; data: string | Img | Maps }) {
        return new MessageModel({
            destination: destination,
            creator: creator,
            content: content,
            date: new Date(),
            views: 0,
            posReaction: 0,
            negReaction: 0,
        }).save();
    }

    public async getMessages() {
        return MessageModel.find({});
    }
}
