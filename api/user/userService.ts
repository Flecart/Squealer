import mongoose from 'mongoose';
import { IUser } from '@model/user';
import UserModel from '@db/user';
import AuthUserModel from '@db/auth';
import { IQuotas } from '@model/quota';
import { HttpError } from '@model/error';

type UserModelType = mongoose.HydratedDocument<IUser>;

export default class UserService {
    public async delNotification(username: string): Promise<string> {
        const userModel = await UserModel.findOne({ username: username }).exec();
        if (userModel == null) throw new HttpError(404, 'User not found');
        userModel.messages.filter((message) => !message.viewed).forEach((message) => (message.viewed = true));
        userModel.markModified('messages');
        userModel.save();
        return 'success';
    }

    public async getNotifications(username: string): Promise<string[]> {
        const userModel = await UserModel.findOne({ username: username }).exec();
        if (userModel == null) throw new HttpError(404, 'User not found');
        const unreadedMessage = userModel.messages
            .filter((message) => !message.viewed)
            .map((message) => message.message.toString());
        return unreadedMessage;
    }

    public async getUser(username: string): Promise<IUser> {
        const userModel = await UserModel.findOne({ username: username }).exec();
        if (userModel == null) throw new HttpError(404, 'User not found');
        return userModel;
    }

    public async deleteUser(username: string): Promise<any> {
        const authModel = await AuthUserModel.findOne({ username: username }, 'userId').exec();
        if (authModel == null) throw new HttpError(404, 'User not Found');
        UserModel.deleteOne({ _id: authModel.userId }).exec();
        AuthUserModel.deleteOne({ username: username }).exec();
        return { message: 'User deleted' };
    }

    public async getQuota(username: string): Promise<IQuotas> {
        const user = await UserModel.findOne({ username: username }, 'usedQuota').exec();
        if (user == null) throw new HttpError(404, 'User not Found');
        return user.usedQuota;
    }

    public async purchaseQuota(
        username: string,
        dailyQuota: number,
        weeklyQuota: number,
        monthlyQuota: number,
    ): Promise<any> {
        const creator = await UserModel.findOne({ username: username });
        if (!creator) {
            throw new HttpError(404, 'Username not found');
        }
        this.changeQuota(creator, dailyQuota, weeklyQuota, monthlyQuota);
        return { message: 'Quota Purchased Successfully' };
    }

    private async changeQuota(
        creator: UserModelType,
        dailyQuota: number,
        weeklyQuota: number,
        monthlyQuota: number,
    ): Promise<void> {
        creator.usedQuota.day += dailyQuota;
        if (creator.usedQuota.day < 0) {
            creator.usedQuota.day = 0;
        } else if (creator.usedQuota.day > creator.maxQuota.day) {
            creator.usedQuota.day = creator.maxQuota.day;
        }

        creator.usedQuota.week += weeklyQuota;
        if (creator.usedQuota.week < 0) {
            creator.usedQuota.week = 0;
        } else if (creator.usedQuota.week > creator.maxQuota.week) {
            creator.usedQuota.week = creator.maxQuota.week;
        }

        creator.usedQuota.month += monthlyQuota;
        if (creator.usedQuota.month < 0) {
            creator.usedQuota.month = 0;
        } else if (creator.usedQuota.month > creator.maxQuota.month) {
            creator.usedQuota.month = creator.maxQuota.month;
        }

        creator.markModified('usedQuota');
        await creator.save();
        console.log(`Daily quota updated to ${creator.usedQuota.day}`);
    }
}
