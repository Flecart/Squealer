import { IMessage } from '@model/message';
import ChannelModel from '@db/channel';
import ISearchResult from '@model/search';
import MessageModel from '@db/message';
import { ChannelType, IChannel } from '@model/channel';
import { isPublicChannel } from '@model/channel';

export class SearchService {
    public async search(user: string, search: string): Promise<ISearchResult> {
        const checkChannel = (channel: IChannel) => {
            if (isPublicChannel(channel)) {
                return true;
            } else if (
                channel.type === ChannelType.PRIVATE &&
                channel.users.find((u) => u.user === user) != undefined
            ) {
                return true;
            }
            return false;
        };
        const channel = await ChannelModel.find({ name: { $regex: search } }, '_id users type');
        const channelIds = channel.filter(checkChannel).map((channel) => channel._id.toString());

        const messageFromModel = await MessageModel.find(
            { 'content.data': { $regex: search }, channel: { $ne: undefined }, 'content.type': 'text' },
            '_id channel',
        );

        const asyncFilter = async (arr: IMessage[], predicate: (a: IMessage) => Promise<boolean>) => {
            const keepOrIgnore = await Promise.all(arr.map(predicate));
            return arr.filter((_, index) => keepOrIgnore[index]);
        };

        const messages = await asyncFilter(messageFromModel, async (message: IMessage) => {
            if (!message.channel) return false;
            const messageFromModel = await ChannelModel.findOne({ name: message.channel });
            if (messageFromModel == null) return false;
            return checkChannel(messageFromModel);
        });

        const messageIds = messages.map((message) => message._id.toString());
        return {
            channel: channelIds,
            messages: messageIds,
        } as ISearchResult;
    }
}
