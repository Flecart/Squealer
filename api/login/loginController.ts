import {Body, Post, Route} from "@tsoa/runtime";
import {IUser} from "../../model/user";


export interface Credentials{
    username:string,
    password:string
};

@Route('/auth/')
export class LoginController {
    
    @Post('')
    public async login(
        @Body() credentials:Credentials
    ) {
        
    }
    
}

