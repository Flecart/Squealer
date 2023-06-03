// @ts-nocheck , typescript è un casino, non scommentarmi a tuo rischio e pericolo

import UserService from './userService';
import UserModel from '@db/user';
import AuthUserModel from '@db/auth';
import { HttpError } from '@model/error';
import { jest } from '@jest/globals';

describe('UserService', () => {
    let userService: UserService;

    beforeEach(() => {
        userService = new UserService();
        UserModel.findOne = jest.fn();
        UserModel.deleteOne = jest.fn();
        AuthUserModel.findOne = jest.fn();
        AuthUserModel.deleteOne = jest.fn();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('delNotification', () => {
        it('should mark all messages as viewed', async () => {
            const userModel = {
                messages: [
                    { viewed: false, message: 'message 1' },
                    { viewed: false, message: 'message 2' },
                ],
                markModified: jest.fn(),
                save: jest.fn(),
            };
            UserModel.findOne.mockResolvedValueOnce(userModel);

            await userService.delNotification('test');

            for (const message of userModel.messages) {
                expect(message.viewed).toBe(true);
            }
            expect(userModel.markModified).toHaveBeenCalledWith('messages');
            expect(userModel.save).toHaveBeenCalled();
        });

        it('should throw an error if the user is not found', async () => {
            UserModel.findOne.mockResolvedValueOnce(null);

            await expect(userService.delNotification('test')).rejects.toThrow(HttpError);
        });
    });

    describe('getNotifications', () => {
        it('should return an array of unread messages', async () => {
            const userModel = {
                messages: [
                    { viewed: false, message: 'message 1' },
                    { viewed: true, message: 'message 2' },
                ],
            };
            UserModel.findOne.mockResolvedValueOnce(userModel);

            const result = await userService.getNotifications('test');

            expect(result).toEqual(['message 1']);
        });

        it('should throw an error if the user is not found', async () => {
            UserModel.findOne.mockResolvedValueOnce(null);

            await expect(userService.getNotifications('test')).rejects.toThrow(HttpError);
        });
    });

    describe('getUser', () => {
        it('should return the user', async () => {
            const userModel = { username: 'test' };
            UserModel.findOne.mockResolvedValueOnce(userModel);

            const result = await userService.getUser('test');

            expect(result).toBe(userModel);
        });

        it('should throw an error if the user is not found', async () => {
            UserModel.findOne.mockResolvedValueOnce(null);

            await expect(userService.getUser('test')).rejects.toThrow(HttpError);
        });
    });

    describe('deleteUser', () => {
        it('should delete the user and auth record', async () => {
            const authModel = { userId: '123' };
            AuthUserModel.findOne.mockResolvedValueOnce(authModel);

            await userService.deleteUser('test');

            expect(UserModel.deleteOne).toHaveBeenCalledWith({ _id: authModel.userId });
            expect(AuthUserModel.deleteOne).toHaveBeenCalledWith({ username: 'test' });
        });

        it('should throw an error if the user is not found', async () => {
            AuthUserModel.findOne.mockResolvedValueOnce(null);

            await expect(userService.deleteUser('test')).rejects.toThrow(HttpError);
        });
    });

    describe('getQuota', () => {
        it('should return the user quota', async () => {
            const userModel = { usedQuota: { day: 0, month: 0, year: 0 } };
            UserModel.findOne.mockResolvedValueOnce(userModel);

            const result = await userService.getQuota('test');

            expect(result).toBe(userModel.usedQuota);
        });

        it('should throw an error if the user is not found', async () => {
            UserModel.findOne.mockResolvedValueOnce(null);

            await expect(userService.getQuota('test')).rejects.toThrow(HttpError);
        });
    });
});
