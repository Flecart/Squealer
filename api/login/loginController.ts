import { Body, Post, Route, Response, SuccessResponse, Controller } from '@tsoa/runtime';
import { LoginService } from './loginService';
import { type AuthRensponse } from '@model/auth';
import { HttpError } from '@model/error';

export interface Credentials {
    username: string;
    password: string;
}

@Route('/auth/')
export class LoginController extends Controller {
    @Post('login')
    @Response<HttpError>(401, 'Unauthorized')
    @SuccessResponse(200, 'Login successful')
    public async login(@Body() credentials: Credentials): Promise<AuthRensponse> {
        return new LoginService().login(credentials.username, credentials.password);
    }

    @Post('create')
    @Response<HttpError>(400, 'Bad request')
    @SuccessResponse<AuthRensponse>(201, 'Created')
    public async createUser(@Body() credentials: Credentials): Promise<AuthRensponse> {
        return new LoginService().createUser(credentials.username, credentials.password);
    }
}
