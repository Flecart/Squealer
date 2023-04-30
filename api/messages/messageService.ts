import UserAuthModel from '@model/auth';
import MessageModel, { Img, Maps } from '@model/message';
//import mongoose from 'mongoose';

export class MessageService {
    public async create(destination: string, content: { type: string; data: string | Img | Maps }, username: string) {
        const c = await UserAuthModel.findOne({ username: username });

        return new MessageModel({
            destination: destination,
            creator: c,
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
