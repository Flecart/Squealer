import { IUser } from '@model/user';
import ModelUserAuth from '@model/auth';
export default class UserService {
    public async getUser(username: string): Promise<IUser> {
        console.log(username);
        const authModel = await ModelUserAuth.findOne({ username: username }, 'userId')
            .populate<{ userId: IUser }>('userId')
            .exec();
        if (authModel == null) throw new Error('User not found');
        const userModel = authModel.userId;
        return userModel;
    }
}
