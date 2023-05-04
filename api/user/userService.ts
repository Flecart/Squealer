import ModelUser, { IUser } from '@model/user';
import ModelUserAuth from '@model/auth';
import UserModel from '@model/user';
import { IQuotas } from '@model/quota';
import { HttpError } from '@model/error';

export default class UserService {
    public async getUser(username: string): Promise<IUser> {
        const authModel = await ModelUserAuth.findOne({ username: username }, 'userId')
            .populate<{ userId: IUser }>('userId')
            .exec();
        if (authModel == null) throw new HttpError(404, 'User not Found');
        const userModel = authModel.userId;
        return userModel;
    }

    public async deleteUser(username: string): Promise<any> {
        const authModel = await ModelUserAuth.findOne({ username: username }, 'userId').exec();
        if (authModel == null) throw new HttpError(404, 'User not Found');
        ModelUser.deleteOne({ _id: authModel.userId }).exec();
        ModelUserAuth.deleteOne({ username: username }).exec();
        return { message: 'User deleted' };
    }

    public async getQuota(username: string): Promise<IQuotas> {
        const user = await UserModel.findOne({ username: username }, 'usedQuota').exec();
        if (user == null) throw new HttpError(404, 'User not Found');
        return user.usedQuota;
    }
}
