import UserModel from "../../model/user";
import crypto from "crypto";
import * as jose from 'jose';

function hashPassword(username:string, password:string){
    return crypto.createHash('sha512').update(process.env['PASS_HASH']+username+password).digest('hex');
}

const jwt_alg=process.env['JWT_ALG'] || 'HS256';
const jwt_secrt=  new TextEncoder().encode(process.env["JWT_TOKEN"]|| 'secret');

async function  createJWTSession(username:string){
  return await new jose.SignJWT({ 'username': username })
    .setProtectedHeader({alg:jwt_alg})
    .setIssuedAt()
    .setIssuer('urn:example:issuer')
    .setAudience('urn:example:audience')
    .setExpirationTime('8s')
    .sign(jwt_secrt);
}


export class LoginService{
    
    public async createUser(username:string,password:string) {
        const model=await new UserModel({
            username:username,
            password:hashPassword(username,password),
            role:"normal",
            channels:[],
            day_quote:0,
            month_quote:0,
            week_quote:0,
            clients:[]
        }).save()
        if(model){
            return createJWTSession(username);
        }
        return Promise.reject({status:401,message:"Invalid username or password"});
    }
    public async login(username:string,password:string) {
        const model=await UserModel.findOne({username:username,password:hashPassword(username,password)});
        if(model){
            return createJWTSession(model.username);
        }
        return Promise.reject({status:401,message:"Invalid username or password"});
    }

}