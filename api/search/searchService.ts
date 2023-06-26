import ChannelModel from '@db/channel';
import MessageModel from '@db/message';

export class SearchService {
    public async search(user: string, search: string): Promise<string[]> {
        if (search.startsWith('§') || search.startsWith('#')) {
            let searchChannel = search;
            if (search.startsWith('§')) {
                searchChannel = searchChannel.substring(1);
            }
            // const channel = await ChannelModel().find({ name: searchChannel });
        }
        const messageFromModel = await MessageModel.find(
            { $text: { $search: search }, channel: { $ne: undefined } },
            '_id',
        );

        const asyncFilter = async (arr, predicate) => {
            const results = await Promise.all(arr.map(predicate));
            return arr.filter((_v, index) => results[index]);
        };

        const messages = await asyncFilter(messageFromModel, async (message) => {
            const messageFromModel = await ChannelModel.findOne({ name: message.channel });
            if (messageFromModel) {
                switch (messageFromModel) {
                }
            } else {
                return false;
            }
        });

        const messageIds = messages.map((message) => message._id.toString());
        return messageIds;
    }
}
