import { UserRoles } from '@model/user';
import UserModel from '@db/user';
import AuthModel from '@db/auth';
import { HttpError } from '@model/error';
import { UserModRensponse } from '@model/user';
import { IQuotas } from '@model/quota';

export class ModdashService {
    public async changeQuota(admin: string, user: string, quota: IQuotas): Promise<void> {
        const current = await UserModel.findOne({ username: admin });
        if (!current) throw new HttpError(404, 'Admin not found');
        if (current.role !== UserRoles.MODERATOR) throw new HttpError(403, 'You are not a moderator');
        const target = await UserModel.findOne({ username: user });
        if (!target) throw new HttpError(404, 'User not found');
        target.maxQuota = quota;
        await target.save();
    }
    public async suspendUser(admin: string, user: string, suspended: boolean): Promise<void> {
        const current = await UserModel.findOne({ username: admin });
        if (!current) throw new HttpError(404, 'Admin not found');
        if (current.role !== UserRoles.MODERATOR) throw new HttpError(403, 'You are not a moderator');
        const target = await AuthModel.findOne({ username: user });
        if (!target) throw new HttpError(404, 'User not found');
        target.set('suspended', suspended);
        await target.save();
    }

    public async listUsers(userId: string): Promise<UserModRensponse[]> {
        const current = await UserModel.findOne({ username: userId });
        if (!current) throw new HttpError(404, 'User not found');
        if (current.role !== UserRoles.MODERATOR) throw new HttpError(403, 'You are not a moderator');
        const all = await UserModel.find({ roule: { $ne: UserRoles.MODERATOR } });
        const res: UserModRensponse[] = [];
        for (let user of all) {
            const auth = await AuthModel.findOne({ username: user.name });
            if (auth) {
                res.push({
                    suspended: auth.suspended,
                    name: user.name,
                    username: user.username,
                    profile_pic: user.profile_pic,
                    channels: user.channels,
                    usedQuota: user.usedQuota,
                    maxQuota: user.maxQuota,
                    clients: user.clients,
                    messages: user.messages,
                    channel: user.channel,
                    role: user.role,
                } as UserModRensponse);
            }
        }
        return res;
    }
}
