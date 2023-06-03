import { IMessage } from '@model/message';
import ChannelModel from '@db/channel';
import { ChannelType } from '@model/channel';
import { MessageService } from '@api/messages/messageService';

export class FeedService {
    // Remember to update always the views
    public async getMessages(user: string | null): Promise<IMessage[]> {
        const visibleChannel = await ChannelModel.find({
            $or: [{ type: ChannelType.PUBLIC }, { type: ChannelType.SQUEALER }, { type: ChannelType.HASHTAG }],
        });
        const allMessage = visibleChannel.map((channel) => {
            return channel.messages.map((message) => message.toString());
        });
        const messages = await new MessageService().getMessages((await Promise.all(allMessage)).flat());
        if (user === null) {
            return messages;
        }
        return messages.filter((message) => message.creator !== user);
    }
}
