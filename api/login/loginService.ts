import { JWT_ALG, JWT_SECRET, JWT_ISSUER } from '@config/config';
import AuthUserModel, { IUserAuth } from '@model/auth';
import { HttpError } from '@model/error';
import UserModel, { IUser } from '@model/user';
import crypto from 'crypto';
import * as jose from 'jose';
import { HydratedDocument, Types } from 'mongoose';
import { AuthRensponse } from '@model/auth';

export class LoginService {
    public async createUser(name: string, password: string): Promise<AuthRensponse> {
        const username = await this._createUserName(name);

        const userModel = this._createDefaultUser(username,name);
        await userModel.save();

        const userAuthModel = this._createDefaultUserAuth(username, password, userModel._id);
        await userAuthModel.save();

        return {
            username: username,
            token: await this._createJWTSession(username),
        } as AuthRensponse;
    }

    public async login(username: string, password: string): Promise<AuthRensponse> {
        const model = await AuthUserModel.findOne({ username: username }, 'username role salt password');
        if (model && model.password == this._hashPassword(model.salt, password)) {
            return {
                username: username,
                token: await this._createJWTSession(model.username, model.role),
            } as AuthRensponse;
        }

        return Promise.reject(new HttpError(401, 'Invalid username or password'));
    }

    private async _createUserName(name: string): Promise<string> {
        // TODO: simplify me
        const usernamePref = name.toLowerCase().split(' ').join('');
        let username = '';
        const isPresent = (await AuthUserModel.count({ username: usernamePref }).exec()) > 0;

        if (isPresent) {
            const lastName = await AuthUserModel.find({ username: new RegExp(`^${usernamePref}[0-9]*$`) }, 'username')
                .sort({ username: -1 })
                .limit(1)
                .exec();

            const lastNameNumber =
                lastName && lastName[0] ? parseInt(lastName[0].username.replace(usernamePref, '')) + 1 : 1;
            username = usernamePref + lastNameNumber.toString();
        } else {
            username = usernamePref;
        }

        return username;
    }

    private _createDefaultUser(username:string,name: string): HydratedDocument<IUser> {
        return new UserModel({
            name: name,
            channels: [],
            day_quote: 0,
            week_quote: 0,
            month_quote: 0,
            profile_pic:`https://api.dicebear.com/6.x/notionists/svg?seed=${username}`,
            clients: [],
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
