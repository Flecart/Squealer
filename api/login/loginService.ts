import { JWT_ALG, JWT_SECRET, JWT_ISSUER } from "../../config/config";
import AuthUserModel from "../../model/auth";
import UserModel from "../../model/user";
import crypto from "crypto";
import * as jose from 'jose';

function hashPassword(username:string, password:string) {
    return crypto.createHash('sha512').update(process.env['PASS_HASH'] + username + password).digest('hex');
}

async function createJWTSession(username:string, role?: string) {
  return await new jose.SignJWT({ username, role: role ?? 'normal' })
    .setProtectedHeader({ alg: JWT_ALG})
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setAudience('urn:example:audience')
    .setExpirationTime('2h')
    .sign(JWT_SECRET);
}

export class LoginService{
    public async createUser(name: string, password: string) {
        try {
            const usernamePref = name.toLowerCase().split(' ').join('');
            let username = '';
            const isPresent = await AuthUserModel.findOne({username: usernamePref}).exec() !== null;
            if (!isPresent) {
                const lastName = await AuthUserModel.find({username: new RegExp('^' + usernamePref + '[0-9]*$')}, "username")
                    .sort({username: -1})
                    .limit(1)
                    .exec();

                const lastNameNumber = lastName && lastName[0] ? parseInt(lastName[0].username.replace(usernamePref, '')) + 1 : 1;
                username = usernamePref + lastNameNumber.toString();
            } else {
                username = usernamePref;
            }
            
            const userModel = await new UserModel({
                name: name,
                channels:[],
                day_quote:0,
                week_quote:0,
                month_quote:0,
                profile_pic:"None",
                clients:[],
            }).save();
            
            const salt = crypto.randomBytes(16).toString('hex');
            const authModel = await new AuthUserModel({
                username: username,
                password: hashPassword(username, salt + password),
                salt: salt,
                role: 'normal',
                userId: userModel._id,
            }).save()

            if (authModel) {
                return createJWTSession(username);
            }
        } catch (e) {
            console.log(e);
            return Promise.reject({status:500, message:"Internal server error"});
        }
        
        return Promise.reject({status:401, message:"Invalid username or password"});
    }

    public async login(username: string, password: string) {
        try {
            const model = await AuthUserModel.findOne({username: username}, "salt password");
            if (model && model.password == hashPassword(model.username, model.salt + password)){
                return createJWTSession(model.username);
            }
        } catch (e) {
            // TODO: change error to more precise errors
            if (e instanceof Error) {
                console.log(e.message);
            } else {
                console.log(e);
            }
            return Promise.reject({status:500, message:"Internal server error"});
        }

        return Promise.reject({status:401,message:"Invalid username or password"});
    }
}