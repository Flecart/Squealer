import ChannelModel from '@db/channel';
import { ChannelType, IChannel } from '@model/channel';
import { MessageService } from '@api/messages/messageService';
import UserModel from '@db/user';
import { HttpError } from '@model/error';
import { IMessage, mapReactionToNumber } from '@model/message';

export class FeedService {
    // Remember to update always the views
    public async getMessages(user: string | null): Promise<string[]> {
        //il prof dice che senza login solo canali ufficiali
        const squalerChannel = await ChannelModel.find({ type: ChannelType.SQUEALER });
        const squalerMessages = squalerChannel
            .map((channel) => {
                return channel.messages.map((message) => message.toString());
            })
            .flat();

        const squalerMessagesSorted = await this.bestAndResolveMessage(squalerMessages, user === null ? 100 : 20);
        if (user === null) {
            return squalerMessagesSorted;
        }

        const userRecord = await UserModel.findOne({ username: user });
        if (userRecord === null) throw new HttpError(404, 'User not found');
        // split channely by type

        const channels = (
            await Promise.all(userRecord.channel.map((id: string) => ChannelModel.find({ name: id })))
        ).flat();
        //split in array by the type of channel

        const channelToMessage = (channel: IChannel | null): string[] => {
            if (channel === null) return [];
            return channel.messages.map((message) => message.toString());
        };
        const userMessages = channels
            .filter((channel) => channel !== null && channel.type === ChannelType.USER)
            .map(channelToMessage)
            .flat();

        const bestMessages = await this.bestAndResolveMessage(userMessages, 20, user);

        const joinedChannel = channels
            .filter((channel) => channel !== null && channel.type !== ChannelType.USER)
            .map(channelToMessage)
            .flat();

        const bestMessagesJoined = await this.bestAndResolveMessage(joinedChannel, 30, user);

        return [...bestMessages, ...bestMessagesJoined, ...squalerMessagesSorted];
    }

    private async bestAndResolveMessage(message: string[], limit?: number, user?: string): Promise<string[]> {
        const squalerIMessage = await new MessageService().getMessages(message, false);
        return this.bestPerCategory(squalerIMessage, limit, user);
    }

    private bestPerCategory(message: IMessage[], limit?: number, user?: string): string[] {
        if (user !== undefined) message = message.filter((message: IMessage) => message.creator !== user);

        const best = message
            .map((message) => {
                const reactionValue = message.reaction.reduce(
                    (acc, reaction) => acc + (mapReactionToNumber.get(reaction.type) ?? 0),
                    0,
                );
                //voglio che sia inversamente proporzionale al tempo
                const recentlyValue = -Math.log(((Date.now() - message.date.getTime()) / 1000) * 60 * 60);
                return {
                    message,
                    value: reactionValue + recentlyValue,
                };
            })
            .sort((a, b) => b.value - a.value);
        if (limit === null) return best.map((n) => n.message._id.toString());
        const popular = best.slice(0, limit);
        return popular.map((n) => n.message._id.toString());
    }
}
