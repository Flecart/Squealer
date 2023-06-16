import { IUser, UserRoles } from '@model/user';
import UserModel from '@db/user';
import { HttpError } from '@model/error';

export class ModdashService {
    public async listUsers(userId: string): Promise<IUser[]> {
        const current = await UserModel.findOne({ name: userId });
        if (!current) throw new HttpError(404, 'User not found');
        if (current.role !== UserRoles.MODERATOR) throw new HttpError(403, 'You are not a moderator');
        const all = await UserModel.find({ roule: { $ne: UserRoles.MODERATOR } });
        return all;
    }
}
