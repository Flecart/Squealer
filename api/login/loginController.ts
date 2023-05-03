import { Body, Post, Route, Request, Response, SuccessResponse, Controller, Security } from '@tsoa/runtime';
import { LoginService } from './loginService';
import { type AuthResponse } from '@model/auth';
import { HttpError } from '@model/error';
import { getUserFromRequest } from '@api/utils';

export interface Credentials {
    username: string;
    password: string;
}

@Route('/auth/')
export class LoginController extends Controller {
    @Post('login')
    @Response<HttpError>(401, 'Unauthorized')
    @SuccessResponse(200, 'Login successful')
    public async login(@Body() credentials: Credentials): Promise<AuthResponse> {
        return new LoginService().login(credentials.username, credentials.password);
    }

    @Post('create')
    @Response<HttpError>(400, 'Bad request')
    @SuccessResponse<AuthResponse>(201, 'Created')
    public async createUser(@Body() credentials: Credentials): Promise<AuthResponse> {
        return new LoginService().createUser(credentials.username, credentials.password);
    }

    @Post('user/{username}/change-password')
    @Security('jwt')
    @Response<HttpError>(400, 'Bad request')
    @SuccessResponse<AuthResponse>(200, 'Password changed')
    public async changePassword(
        @Body() password_change: { old_password: string; new_password: string },
        @Request() request: any,
    ): Promise<{ message: string }> {
        return new LoginService().changePassword(
            password_change.old_password,
            password_change.new_password,
            getUserFromRequest(request),
        );
    }

    @Post('user/{username}/change-username')
    @Security('jwt')
    @Response<HttpError>(400, 'Bad request')
    @SuccessResponse<AuthResponse>(200, 'Username changed')
    public async changeUsername(
        @Body() new_username: { new_username: string },
        @Request() request: any,
    ): Promise<{ message: string }> {
        return new LoginService().changeUsername(new_username.new_username, getUserFromRequest(request));
    }
}
