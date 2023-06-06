import mongoose from 'mongoose';
import { IUser } from '@model/user';
import UserModel from '@db/user';
import AuthUserModel from '@db/auth';
import { IQuotas } from '@model/quota';
import { HttpError } from '@model/error';

type UserModelType = mongoose.HydratedDocument<IUser>;

export default class UserService {
    public async delNotification(username: string): Promise<string> {
        const userModel = await UserModel.findOne({ username: username });
        if (userModel == null) throw new HttpError(404, 'User not found');
        userModel.messages.filter((message) => !message.viewed).forEach((message) => (message.viewed = true));
        userModel.markModified('messages');
        userModel.save();
        return 'success';
    }

    public async getNotifications(username: string): Promise<string[]> {
        const userModel = await UserModel.findOne({ username: username });
        if (userModel == null) throw new HttpError(404, 'User not found');
        const unreadedMessage = userModel.messages
            .filter((message) => !message.viewed)
            .map((message) => message.message.toString());
        return unreadedMessage;
    }

    public async getUser(username: string): Promise<IUser> {
        const userModel = await UserModel.findOne({ username: username });
        if (userModel == null) throw new HttpError(404, 'User not found');
        return userModel;
    }

    public async deleteUser(username: string): Promise<any> {
        const authModel = await AuthUserModel.findOne({ username: username }, 'userId');
        if (authModel == null) throw new HttpError(404, 'User not Found');
        await UserModel.deleteOne({ _id: authModel.userId });
        await AuthUserModel.deleteOne({ username: username });
        return { message: 'User deleted' };
    }

    public async getQuota(username: string): Promise<IQuotas> {
        const user = await UserModel.findOne({ username: username }, 'usedQuota');
        if (user == null) throw new HttpError(404, 'User not Found');
        return user.usedQuota;
    }

    public async changeQuota(
        creator: UserModelType,
        dailyQuota: number,
        weeklyQuota: number,
        monthlyQuota: number,
    ): Promise<void> {
        creator.maxQuota.day += dailyQuota;
        if (creator.maxQuota.day < 0) {
            creator.maxQuota.day = 0;
        } else if (creator.maxQuota.day > creator.maxQuota.day) {
            creator.maxQuota.day = creator.maxQuota.day;
        }

        creator.maxQuota.week += weeklyQuota;
        if (creator.maxQuota.week < 0) {
            creator.maxQuota.week = 0;
        } else if (creator.maxQuota.week > creator.maxQuota.week) {
            creator.maxQuota.week = creator.maxQuota.week;
        }

        creator.maxQuota.month += monthlyQuota;
        if (creator.maxQuota.month < 0) {
            creator.maxQuota.month = 0;
        } else if (creator.maxQuota.month > creator.maxQuota.month) {
            creator.maxQuota.month = creator.maxQuota.month;
        }

        creator.markModified('maxQuota');
        await creator.save();
        console.log(`Daily quota updated to ${creator.maxQuota.day}`);
    }
}
