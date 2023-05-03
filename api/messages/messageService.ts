import UserModel from '@model/user';
import ChannelModel from '@model/channel';
import MessageModel, { Img, Maps } from '@model/message';
import { HttpError } from '@model/error';

export class MessageService {
    public async create(destination: string, content: { type: string; data: string | Img | Maps }, username: string) {
        const creatorName = await UserModel.findOne({ username: username });
        const channel = await ChannelModel.findOne({ name: destination });

        if (!creatorName) {
            throw new HttpError(404, 'Username not found');
        } else if (!channel) {
            throw new HttpError(404, 'Channel not found');
        }

        return new MessageModel({
            channel: channel._id,
            parent: null,
            content,
            children: [],
            creator: creatorName._id,
            date: new Date(),
            views: 0,
            posReaction: [],
            negReaction: [],
        }).save();
    }

    public async getMessages() {
        return MessageModel.find({});
    }
}
