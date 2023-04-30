import { IUser } from '@model/user';
import ModelUserAuth, { IUserAuth } from '@model/auth';
import ModelMessage from '@model/message';
import { IQuotas } from '@model/quota';
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
    public async getQuota(username: string): Promise<IQuotas> {
        const authModel = await ModelUserAuth.findOne({ username: username }, 'userId').exec();

        const messages = await ModelMessage.find({ creator: authModel }, 'content creator date')
            .populate<{ creator: IUserAuth }>('creator')
            .exec();

        let quota: IQuotas = {
            total: 0,
            day: 0,
            month: 0,
            week: 0,
            extraQuota: 0,
        };

        let quotaMess: number = 0;

        messages.forEach((message) => {
            switch (message.content.type) {
                case 'text':
                    quotaMess = message.content.data.replace(/\s/g, '').length;
                    break;
                case null:
                    quotaMess = 0;
                    break;
                default:
                    quotaMess = 100;
                    break;
            }
            quota.total += quotaMess;
            message.date.getDate() == new Date().getDate() ? (quota.day += quotaMess) : null;
            message.date.getMonth() == new Date().getMonth() ? (quota.month += quotaMess) : null;
            message.date.getDay() == new Date().getDay() ? (quota.week += quotaMess) : null;
        });
        return quota;
    }
}
