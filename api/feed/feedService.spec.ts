// @ts-nocheck
import { FeedService } from './feedService';
import { IMessage } from '@model/message';
import ChannelModel from '@db/channel';
import { ChannelType } from '@model/channel';
import { MessageService } from '@api/messages/messageService';

jest.mock('@api/messages/messageService');

describe('FeedService', () => {
    let feedService: FeedService;

    beforeEach(() => {
        jest.clearAllMocks();
        feedService = new FeedService();
        ChannelModel.find = jest.fn();
    });

    describe('getMessages', () => {
        const user = 'testuser1';
        const message1id = 'testmessageid1';
        const message2id = 'testmessageid2';
        const message3id = 'testmessageid3';
        const message1 = { _id: message1id, creator: 'testuser1' };
        const message3 = { _id: message2id, creator: 'testuser3' };
        const message2 = { _id: message3id, creator: 'testuser2' };
        const channel1 = { type: ChannelType.PUBLIC, messages: [message1id] };
        const channel2 = { type: ChannelType.SQUEALER, messages: [message2id] };
        const channel3 = { type: ChannelType.HASHTAG, messages: [message3id] };

        beforeEach(() => {
            (ChannelModel.find as jest.Mock).mockResolvedValueOnce([channel1, channel2, channel3]);
            (MessageService.prototype.getMessages as jest.Mock).mockResolvedValueOnce([message1, message2, message3]);
        });

        it('should return all messages if user is null', async () => {
            const result = await feedService.getMessages(null);

            expect(ChannelModel.find).toHaveBeenCalledWith({
                $or: [{ type: ChannelType.PUBLIC }, { type: ChannelType.SQUEALER }, { type: ChannelType.HASHTAG }],
            });
            expect(MessageService.prototype.getMessages).toHaveBeenCalledWith([
                'testmessageid1',
                'testmessageid2',
                'testmessageid3',
            ]);
            expect(result).toEqual([message1, message2, message3]);
        });

        it('should return messages not created by user', async () => {
            const result = await feedService.getMessages(user);

            expect(ChannelModel.find).toHaveBeenCalledWith({
                $or: [{ type: ChannelType.PUBLIC }, { type: ChannelType.SQUEALER }, { type: ChannelType.HASHTAG }],
            });
            expect(MessageService.prototype.getMessages).toHaveBeenCalledWith([
                'testmessageid1',
                'testmessageid2',
                'testmessageid3',
            ]);
            expect(result).toEqual([message2, message3]);
        });
    });

    // Add more tests for other methods as needed
});
