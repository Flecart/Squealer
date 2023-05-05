import { JWT_ALG, JWT_SECRET, JWT_ISSUER } from '@config/config';
import AuthUserModel, { IUserAuth } from '@model/auth';
import { HttpError } from '@model/error';
import UserModel, { IUser } from '@model/user';
import crypto from 'crypto';
import * as jose from 'jose';
import { HydratedDocument, Types } from 'mongoose';
import { AuthResponse } from '@model/auth';
import { DEFAULT_QUOTA } from '@config/api';

export class LoginService {
    public async createUser(name: string, password: string): Promise<AuthResponse> {
        const username = await this._createUserName(name);

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
        const model = await AuthUserModel.findOne({ username: username }, 'username role salt password');
        if (model && model.password == this._hashPassword(model.salt, password)) {
            return {
                username: username,
                token: await this._createJWTSession(model.username, model.role),
            } as AuthResponse;
        }

        return Promise.reject(new HttpError(401, 'Invalid username or password'));
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

    public async changeUsername(new_username: string, current_username: string): Promise<{ message: string }> {
        const authUser = await AuthUserModel.findOne({ username: current_username }, 'username salt password');
        const user = await UserModel.findOne({ username: current_username }, 'username');
        if (authUser === null || user === null) {
            throw new HttpError(400, 'User not found');
        }

        authUser.username = new_username;
        await authUser.save();

        // TODO: può succedere che salvi da uno ma non salvi dall'altro?
        user.username = new_username;
        await user.save();

        return { message: 'Username changed' };
    }

    private async _createUserName(name: string): Promise<string> {
        // TODO: simplify me
        const usernamePref = name.toLowerCase().split(' ').join('');
        let username = '';

        const isPresent = async (username: string) => (await AuthUserModel.count({ username: username }).exec()) > 0;

        if (await isPresent(usernamePref)) {
            const lastName = await AuthUserModel.find({ username: new RegExp(`^${usernamePref}[0-9]*$`) }, 'username')
                .sort({ username: -1 })
                .limit(1)
                .exec();

            if (lastName !== null && lastName.length > 0) {
                const suffix = lastName[0]?.username.replace(usernamePref, '');
                if (suffix === '' || suffix === undefined) username = usernamePref + '1';
                else username = usernamePref + (parseInt(suffix) + 1).toString();
            } else {
                username = usernamePref + '1';
            }
            if (await isPresent(username)) {
                return Promise.reject(new HttpError(400, 'Username already taken'));
            }
        } else {
            username = usernamePref;
        }

        return username;
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
            usedQuota: { today: 0, week: 0, month: 0 },
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
            role: 'normal',
            userId: userId,
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
