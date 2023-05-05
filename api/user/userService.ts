import { IUser } from '@model/user';
import UserModel from '@model/user';
import { IQuotas } from '@model/quota';

export default class UserService {
    public async getUser(username: string): Promise<IUser> {
        const userModel = await UserModel.findOne({ username: username }).exec();
        if (userModel == null) throw new Error('User not found');
        return userModel;
    }
    public async getQuota(username: string): Promise<IQuotas> {
        const user = await UserModel.findOne({ username: username }, 'usedQuota').exec();
        if (user == null) throw new Error('User not found');
        return user.usedQuota;
    }
}
