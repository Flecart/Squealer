import { IUser } from '@model/user';
import ModelUserAuth from '@model/auth';
import UserModel from '@model/user';
import { IQuotas } from '@model/quota';
export default class UserService {
    public async getUser(username: string): Promise<IUser> {
        const authModel = await ModelUserAuth.findOne({ username: username }, 'userId')
            .populate<{ userId: IUser }>('userId')
            .exec();
        if (authModel == null) throw new Error('User not found');
        const userModel = authModel.userId;
        return userModel;
    }
    public async getQuota(username: string): Promise<IQuotas> {
        const user = await UserModel.findOne({ username: username }, 'usedQuota').exec();
        if (user == null) throw new Error('User not found');
        return user.usedQuota;
    }
}
