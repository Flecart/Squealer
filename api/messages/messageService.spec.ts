// @ts-nocheck
import { MessageService } from './messageService';
import { HttpError } from '@model/error';
import UserModel from '@db/user';
import ChannelModel from '@db/channel';
import MessageModel from '@db/message';

describe('MessageService', () => {
    let messageService: MessageService;

    beforeEach(() => {
        jest.clearAllMocks();
        messageService = new MessageService();
        UserModel.findOne = jest.fn();
        ChannelModel.findOne = jest.fn();
        MessageModel.findOne = jest.fn();
    });

    describe.only('create', () => {
        const messageContent = 'test message';
        const username = 'testuser';
        const channelId = 'testchannelid';
        const parentId = 'testparentid';
        const messageCreation = {
            content: messageContent,
            channel: channelId,
            parent: parentId,
        };

        beforeEach(() => {
            jest.resetAllMocks();
        });

        // FIXME: find a way to test this, should be jest class mock but diest work
        it.skip('should create message with channel', async () => {
            (UserModel.findOne as jest.Mock).mockResolvedValueOnce({ username });
            (ChannelModel.findOne as jest.Mock).mockResolvedValueOnce({ name: channelId });
            (MessageModel.findOne as jest.Mock).mockResolvedValueOnce({ _id: parentId });
            const result = await messageService.create(messageCreation, username);

            expect(UserModel.findOne).toHaveBeenCalledWith({ username });
            expect(ChannelModel.findOne).toHaveBeenCalledWith({ name: channelId });
            expect(MessageModel.findOne).not.toHaveBeenCalled();
        });

        // FIXME: aa private methods!!
        it.skip('should create message with parent', async () => {
            (ChannelModel.findOne as jest.Mock).mockResolvedValueOnce(null);

            const result = await messageService.create({ ...messageCreation, channel: undefined }, username);

            expect(UserModel.findOne).toHaveBeenCalledWith({ username });
            expect(ChannelModel.findOne).not.toHaveBeenCalled();
            expect(MessageModel.findOne).toHaveBeenCalledWith({ _id: parentId });
            expect(result).toEqual({ id: 'testmessageid', channel: undefined });
        });

        it('should throw HttpError if creator not found', async () => {
            (UserModel.findOne as jest.Mock).mockResolvedValueOnce(null);

            await expect(messageService.create(messageCreation, username)).rejects.toThrow(
                new HttpError(404, 'Username not found'),
            );
        });

        it('should throw HttpError if channel and parent are undefined', async () => {
            (UserModel.findOne as jest.Mock).mockResolvedValueOnce({ id: 'randomuser' });

            await expect(messageService.create({ content: messageContent }, username)).rejects.toThrow(
                new HttpError(400, 'Invalid no parent nor channel'),
            );
        });

        it('should throw HttpError if parent not found', async () => {
            (UserModel.findOne as jest.Mock).mockResolvedValueOnce({ id: 'invalidparentid' });
            (MessageModel.findOne as jest.Mock).mockResolvedValueOnce(null);

            await expect(
                messageService.create({ ...messageCreation, channel: undefined, parent: 'invalidparentid' }, username),
            ).rejects.toThrow(new HttpError(404, 'Parent not found'));
        });
    });

    // Add more tests for other methods as needed
});
