import {Body, Post, Route,Response} from "@tsoa/runtime";
import { LoginService } from "./loginService";


export interface Credentials{
    username:string,
    password:string
};

@Route('/auth/')
export class LoginController {
    
    @Post('login')
    @Response<string>(200, 'OK')
    public async login(
        @Body() credentials:Credentials
    ) {
       return new LoginService().login(credentials.username,credentials.password); 
    }
    @Post('create')
    @Response<string>(200, 'OK')
    public async createUser(
        @Body() credentials:Credentials
    ) {
        return new LoginService().createUser(credentials.username,credentials.password);
    }
    
    
}

