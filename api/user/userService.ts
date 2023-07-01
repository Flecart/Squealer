import mongoose from 'mongoose';
import { type NotificationRensponse, type IUser, UserRoles } from '@model/user';
import UserModel from '@db/user';
import AuthUserModel from '@db/auth';
import { type IQuotas } from '@model/quota';
import { HttpError } from '@model/error';
import { type IInvitationRensponse } from '@model/invitation';
import InvitationModel from '@db/invitation';
import { type ISuggestion } from '@model/channel';

type UserModelType = mongoose.HydratedDocument<IUser>;

export default class UserService {
    public async delNotification(username: string, id: string): Promise<string> {
        const userModel = await UserModel.findOne({ username: username });
        if (userModel == null) throw new HttpError(404, 'User not found');
        userModel.messages = userModel.messages.filter((message) => message.message.toString() !== id);
        userModel.markModified('messages');
        userModel.save();
        return 'success';
    }

    public async delNotifications(username: string): Promise<string> {
        const userModel = await UserModel.findOne({ username: username });
        if (userModel == null) throw new HttpError(404, 'User not found');
        userModel.messages.filter((message) => !message.viewed).forEach((message) => (message.viewed = true));
        userModel.markModified('messages');
        userModel.save();
        return 'success';
    }

    public async getNotifications(username: string): Promise<NotificationRensponse> {
        const userModel = await UserModel.findOne({ username: username });
        if (userModel == null) throw new HttpError(404, 'User not found');
        const invitations = userModel.invitations.map((invitation) => invitation.toString());
        const unreadedMessage = userModel.messages
            .filter((message) => !message.viewed)
            .map((message) => message.message.toString());

        return {
            message: unreadedMessage,
            invitation: invitations,
        } as NotificationRensponse;
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

    public async purchaseQuota(
        username: string,
        dailyQuota: number,
        weeklyQuota: number,
        monthlyQuota: number,
    ): Promise<any> {
        const user = await UserModel.findOne({ username: username });
        if (!user) {
            throw new HttpError(404, 'Username not found');
        }
        if (user.role !== UserRoles.VIP && user.role !== UserRoles.SMM && user.role !== UserRoles.VERIFIED) {
            throw new HttpError(400, 'User has not Permitions');
        }
        if (dailyQuota < 0 || weeklyQuota < 0 || monthlyQuota < 0) {
            throw new HttpError(400, 'Cannot purchase negative Quota!');
        }
        this.changeQuota(user, dailyQuota, weeklyQuota, monthlyQuota);
        return { message: 'Quota Purchased Successfully' };
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
    }

    public async updateRole(username: string, role: UserRoles): Promise<IUser> {
        const user = await UserModel.findOne({ username: username });
        if (user == null) {
            throw new HttpError(404, 'User not found');
        }
        user.role = role;
        await user.save();
        return user;
    }

    public async getInvitations(username: string): Promise<IInvitationRensponse[]> {
        const user = await UserModel.findOne({ username: username });

        if (user == null) {
            throw new HttpError(404, 'User not found');
        }

        const invitation = user.invitations.map((invitation) => InvitationModel.findById(invitation));
        const invitations = await Promise.all(invitation);

        const invitationsResponse: IInvitationRensponse[] = [];
        invitations.forEach((invitation) => {
            if (invitation) {
                invitationsResponse.push({
                    _id: invitation._id.toString(),
                    to: invitation.to,
                    issuer: invitation.issuer,
                    channel: invitation.channel,
                    permission: invitation.permission,
                } as IInvitationRensponse);
            }
        });
        return invitationsResponse;
    }

    public async payDebt(username: string): Promise<{ message: string }> {
        const user = await UserModel.findOne({ username: username });
        if (!user) {
            throw new HttpError(404, 'User not found');
        }
        user.debtQuota = 0;
        await user.save();
        return { message: 'Successfull Payment' };
    }

    public async getSuggestions(username: string, limit: number): Promise<ISuggestion[]> {
        const users = await UserModel.find({ username: { $regex: username, $options: 'i' } }, 'username').limit(limit);

        return users.map((user) => {
            return user.username;
        });
    }
}
