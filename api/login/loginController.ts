import { Body, Get, Post, Route, Request, Response, SuccessResponse, Controller, Security } from '@tsoa/runtime';
import { LoginService } from './loginService';
import { type AuthResponse } from '@model/auth';
import { HttpError } from '@model/error';
import { getUserFromRequest } from '@api/utils';

import logger from '@server/logger';

const loginLogger = logger.child({ label: 'login' });

export interface Credentials {
    username: string;
    password: string;
}

export interface Otp {
    otp: string;
}

@Route('/auth/')
export class LoginController extends Controller {
    @Post('login')
    @Response<HttpError>(401, 'Unauthorized')
    @SuccessResponse(200, 'Login successful')
    public async login(@Body() credentials: Credentials): Promise<AuthResponse> {
        loginLogger.info(`[login] with username '${credentials.username}'`);
        return new LoginService().login(credentials.username, credentials.password);
    }

    @Post('create')
    @Response<HttpError>(400, 'Bad request')
    @SuccessResponse<AuthResponse>(201, 'Created')
    public async createUser(@Body() credentials: Credentials): Promise<AuthResponse> {
        loginLogger.info(`[createUser] with username '${credentials.username}'`);
        return new LoginService().createUser(credentials.username, credentials.password);
    }

    @Post('setting-reset')
    @Security('jwt')
    @Response<HttpError>(400, 'Bad request')
    @SuccessResponse<AuthResponse>(201, 'Reset Activeted')
    public async settingReset(@Body() password: { Password: string }, @Request() request: any): Promise<Otp> {
        loginLogger.info(`[settedReset] for username '${getUserFromRequest(request)}'`);
        return new LoginService().settingReset(password.Password, getUserFromRequest(request));
    }

    @Get('setting-reset')
    @Security('jwt')
    @Response<HttpError>(400, 'Bad request')
    @SuccessResponse<AuthResponse>(201, 'OK')
    public async getEnableReset(@Request() request: any): Promise<{ enableReset: boolean }> {
        loginLogger.info(`[enable requested] for username '${getUserFromRequest(request)}'`);
        return new LoginService().getEnableReset(getUserFromRequest(request));
    }

    @Post('user/{username}/change-password')
    @Security('jwt')
    @Response<HttpError>(400, 'Bad request')
    @SuccessResponse<AuthResponse>(200, 'Password changed')
    public async changePassword(
        @Body() password_change: { old_password: string; new_password: string },
        @Request() request: any,
    ): Promise<{ message: string }> {
        loginLogger.info(`[changePassword] with username '${getUserFromRequest(request)}'`);
        return new LoginService().changePassword(
            password_change.old_password,
            password_change.new_password,
            getUserFromRequest(request),
        );
    }

    @Post('user/{username}/change-name')
    @Security('jwt')
    @Response<HttpError>(400, 'Bad request')
    @SuccessResponse<AuthResponse>(200, 'Username changed')
    public async changeUsername(
        @Body() new_username: { new_name: string },
        @Request() request: any,
    ): Promise<{ message: string }> {
        loginLogger.info(`[changeUsername] with name '${getUserFromRequest(request)}'`);
        return new LoginService().changeUsername(new_username.new_name, getUserFromRequest(request));
    }

    @Post('reset-password')
    @Response<HttpError>(400, 'Bad request')
    @SuccessResponse<AuthResponse>(200, 'Password Resetted')
    public async resetPassword(@Body() c: { reset_password: string; username: string }): Promise<Otp> {
        loginLogger.info(`[resetPassword] from username '${c.username}'`);
        return new LoginService().resetPassword(c.reset_password, c.username);
    }
}
