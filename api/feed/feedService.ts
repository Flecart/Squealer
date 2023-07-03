import ChannelModel from '@db/channel';
import { ChannelType } from '@model/channel';
import { MessageService } from '@api/messages/messageService';
import UserModel from '@db/user';
import { HttpError } from '@model/error';

export class FeedService {
    // Remember to update always the views
    public async getMessages(user: string | null): Promise<string[]> {
        const visibleChannel = await ChannelModel.find({
            $or: [{ type: ChannelType.PUBLIC }, { type: ChannelType.SQUEALER }, { type: ChannelType.HASHTAG }],
        });

        const publicMessage = visibleChannel.map((channel) => {
            return channel.messages.map((message) => message.toString());
        });

        let allMessage = publicMessage.flat();

        if (user !== null) {
            const userRecord = await UserModel.findOne({ username: user });
            if (userRecord == null) throw new HttpError(401, `User is not logged in`);
            const unseen = userRecord.messages.filter((n) => n.viewed).map((n) => n.message.toString());
            allMessage = unseen.concat(allMessage);
        }
        const unique = [...new Set(allMessage)];
        const messages = await new MessageService().getMessages(unique, false);

        const all = user == null ? messages : messages.filter((message) => message.creator !== user);
        return all.map((message) => message._id.toString());
    }
}
