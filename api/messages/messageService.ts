import UserModel from '@model/user';
import ChannelModel from '@model/channel';
import MessageModel, { Img, Maps } from '@model/message';
import { HttpError } from '@model/error';

export class MessageService {
    public async create(destination: string, content: { type: string; data: string | Img | Maps }, username: string) {
        // TODO: forse si può toglere questo controllo perchè l'utente deve essere loggato con il JWT valido
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
            creator: username,
            date: new Date(),
            views: 0,
            posReaction: [],
            negReaction: [],
        }).save();
    }

    public async getMessages() {
        return await MessageModel.find({});
    }
}
