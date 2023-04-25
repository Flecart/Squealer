import { Body, Post, Route, Response, SuccessResponse, Controller } from '@tsoa/runtime';
import { LoginService, type CreateUserResponse } from './loginService';

export interface Credentials {
    username: string;
    password: string;
}

@Route('/auth/')
export class LoginController extends Controller {
    @Post('login')
    @Response<string>(401, 'Unauthorized')
    @SuccessResponse(200, 'Login successful')
    public async login(@Body() credentials: Credentials) {
        return new LoginService().login(credentials.username, credentials.password);
    }

    @Post('create')
    @Response<string>(400, 'Bad request')
    @SuccessResponse<CreateUserResponse>(201, 'Created')
    public async createUser(@Body() credentials: Credentials): Promise<CreateUserResponse> {
        return new LoginService().createUser(credentials.username, credentials.password);
    }
}
