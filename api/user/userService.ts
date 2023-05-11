import { IUser } from '@model/user';
import UserModel from '@db/user';
import AuthUserModel from '@db/auth';
import { IQuotas } from '@model/quota';
import { HttpError } from '@model/error';

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
}
