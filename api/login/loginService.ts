import { JWT_ALG, JWT_SECRET, JWT_ISSUER } from '@config/config';
import { IUserAuth } from '@model/auth';
import { HttpError } from '@model/error';
import { IUser, UserRoles } from '@model/user';
import crypto from 'crypto';
import * as jose from 'jose';
import { HydratedDocument, Types } from 'mongoose';
import { AuthResponse } from '@model/auth';
import { DEFAULT_QUOTA } from '@config/api';
import AuthUserModel from '@db/auth';
import UserModel from '@db/user';
import { type Otp } from './loginController';

export class LoginService {
    public async createUser(name: string, password: string): Promise<AuthResponse> {
        const username = await this._checkUserName(name);

        const userModel = this._createDefaultUser(username, name);
        await userModel.save();

        const userAuthModel = this._createDefaultUserAuth(username, password, userModel._id);
        await userAuthModel.save();

        return {
            username: username,
            token: await this._createJWTSession(username),
        } as AuthResponse;
    }

    public async login(username: string, password: string): Promise<AuthResponse> {
        const model = await AuthUserModel.findOne({ username: username });
        const user = await UserModel.findOne({ username: username });
        if (user === null) {
            throw new HttpError(400, 'User not found');
        }
        if (model && model.suspended) {
            throw new HttpError(400, 'User suspended');
        }
        if (model && model.password == this._hashPassword(model.salt, password)) {
            return {
                username: username,
                token: await this._createJWTSession(model.username, user.role),
            } as AuthResponse;
        }

        throw new HttpError(401, 'Invalid username or password, cant login');
    }

    public async changePassword(
        old_password: string,
        new_password: string,
        username: string,
    ): Promise<{ message: string }> {
        const authUser = await AuthUserModel.findOne({ username: username }, 'username salt password');
        if (authUser === null) {
            throw new HttpError(400, 'User not found');
        }

        if (authUser.password !== this._hashPassword(authUser.salt, old_password)) {
            throw new HttpError(400, 'Invalid password');
        }

        authUser.password = this._hashPassword(authUser.salt, new_password);
        await authUser.save();
        return { message: 'Password changed' };
    }

    public async settingReset(user_password: string, username: string): Promise<Otp> {
        const authUser = await AuthUserModel.findOne({ username: username }, 'password salt');

        if (authUser === null) {
            throw new HttpError(400, 'User not found');
        }

        if (authUser.password !== this._hashPassword(authUser.salt, user_password)) {
            throw new HttpError(400, 'Invalid password');
        }

        authUser.enableReset = true;

        const newOtp = crypto.randomBytes(10).toString('hex');
        authUser.otp = this._hashPassword(authUser.salt, newOtp);
        authUser.save();

        return { otp: newOtp } as Otp;
    }

    public async getEnableReset(username: string): Promise<{ enableReset: boolean }> {
        const authUser = await AuthUserModel.findOne({ username: username }, 'enableReset');
        if (authUser === null) {
            throw new HttpError(400, 'User not found');
        }
        return { enableReset: authUser.enableReset };
    }

    public async resetPassword(reset_password: string, username: string): Promise<Otp> {
        const authUser = await AuthUserModel.findOne({ username: username }, 'enableReset salt otp');
        if (authUser === null) {
            throw new HttpError(400, 'User not found');
        }

        if (!authUser.enableReset) {
            throw new HttpError(400, 'Password Recover Service is not enabled');
        }

        if (authUser.otp !== this._hashPassword(authUser.salt, reset_password)) {
            throw new HttpError(400, 'Invalid password');
        }

        const newPassword = crypto.randomBytes(5).toString('hex');
        authUser.password = this._hashPassword(authUser.salt, newPassword);
        authUser.save();

        return { otp: newPassword } as Otp;
    }

    private async _checkUserName(name: string): Promise<string> {
        const alphaNumericalRegex = /^[a-zA-Z0-9]+$/;
        name = name.toLocaleLowerCase();
        if (name.length < 2) {
            return Promise.reject(new HttpError(400, 'Username too short, minimum of 2 characters'));
        } else if ((await AuthUserModel.count({ username: name })) > 0) {
            return Promise.reject(new HttpError(400, 'Username already taken'));
        } else if (!alphaNumericalRegex.test(name)) {
            return Promise.reject(new HttpError(400, 'Username must be alphanumeric (letters and numbers, no spaces)'));
        }
        return name;
    }

    private _createDefaultUser(username: string, name: string): HydratedDocument<IUser> {
        return new UserModel({
            name: name,
            username: username,
            channels: [],
            messages: [],
            profile_pic: `https://api.dicebear.com/6.x/notionists/svg?seed=${username}`,
            clients: [],
            maxQuota: DEFAULT_QUOTA,
            usedQuota: { day: 0, week: 0, month: 0 },
            debtQuota: 0,
            channel: [],
            role: UserRoles.NORMAL,
            invitations: [],
        });
    }

    private _createDefaultUserAuth(
        username: string,
        password: string,
        userId: Types.ObjectId,
    ): HydratedDocument<IUserAuth> {
        const salt = crypto.randomBytes(16).toString('hex');
        return new AuthUserModel({
            username: username,
            password: this._hashPassword(salt, password),
            salt: salt,
            userId: userId,
            enableReset: false,
        });
    }

    private _hashPassword(salt: string, password: string): string {
        return crypto
            .createHash('sha512')
            .update(process.env['PASS_HASH'] + salt + password)
            .digest('hex');
    }

    private async _createJWTSession(username: string, role?: string) {
        return await new jose.SignJWT({ username, role: role ?? 'normal' })
            .setProtectedHeader({ alg: JWT_ALG })
            .setIssuedAt()
            .setIssuer(JWT_ISSUER)
            .setAudience('urn:example:audience')
            .setExpirationTime('2h')
            .sign(JWT_SECRET);
    }
}
