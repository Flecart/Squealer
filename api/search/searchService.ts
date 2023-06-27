import { IMessage } from '@model/message';
import ChannelModel from '@db/channel';
import ISearchResult from '@model/search';
import MessageModel from '@db/message';
import { ChannelType } from '@model/channel';
import { isPublicChannel } from '@model/channel';

export class SearchService {
    public async search(user: string, search: string): Promise<ISearchResult> {
        if (search.startsWith('§') || search.startsWith('#')) {
            let searchChannel = search;
            if (search.startsWith('§')) {
                searchChannel = searchChannel.substring(1);
            }
            const channel = await ChannelModel.find({ name: searchChannel });
            const channelIds = channel.map((channel) => channel._id.toString());
            return {
                channel: channelIds,
                messages: [],
            } as ISearchResult;
        }
        const messageFromModel = await MessageModel.find(
            { 'content.data': { $regex: search }, channel: { $ne: undefined }, 'content.type': 'text' },
            '_id channel',
        );

        const asyncFilter = async (arr: IMessage[], predicate: (a: IMessage) => Promise<boolean>) => {
            const results = await Promise.all(arr.map(predicate));
            return arr.filter((_v, index) => results[index]);
        };

        const messages = await asyncFilter(messageFromModel, async (message: IMessage) => {
            if (!message.channel) return false;
            const messageFromModel = await ChannelModel.findOne({ name: message.channel });
            if (messageFromModel) {
                if (isPublicChannel(messageFromModel)) {
                    return true;
                } else if (
                    messageFromModel.type === ChannelType.PRIVATE &&
                    messageFromModel.users.find((u) => u.user === user) != undefined
                ) {
                    return true;
                }
            }
            return false;
        });

        const messageIds = messages.map((message) => message._id.toString());
        return {
            channel: [],
            messages: messageIds,
        } as ISearchResult;
    }
}
