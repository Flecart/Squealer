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

export interface ResetCredentials {
    resetQuestion: string;
    resetPassword: string;
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
    public async settingReset(
        @Body() credentials: ResetCredentials,
        @Request() request: any,
    ): Promise<{ message: string }> {
        loginLogger.info(`[setdReset] for username '${request}'`);
        return new LoginService().setReset(
            credentials.resetQuestion,
            credentials.resetPassword,
            getUserFromRequest(request),
        );
    }

    @Post('user/{username}/change-password')
    @Security('jwt')
    @Response<HttpError>(400, 'Bad request')
    @SuccessResponse<AuthResponse>(200, 'Password changed')
    public async changePassword(
        @Body() password_change: { old_password: string; new_password: string },
        @Request() request: any,
    ): Promise<{ message: string }> {
        logger.info(`[changePassword] with username '${getUserFromRequest(request)}'`);
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
        logger.info(`[changeUsername] with username '${getUserFromRequest(request)}'`);
        return new LoginService().changeUsername(new_username.new_username, getUserFromRequest(request));
    }

    @Get('user/reset-question')
    @Response<HttpError>(400, 'Bad request')
    @SuccessResponse<AuthResponse>(200, 'OK')
    public async getResetQuestion(@Body() username: { username: string }): Promise<string> {
        return new LoginService().getResetQuestion(username.username);
    }

    @Post('user/{username}/reset-password')
    @Security('jwt')
    @Response<HttpError>(400, 'Bad request')
    @SuccessResponse<AuthResponse>(200, 'Password Resetted')
    public async resetPassword(
        @Body() reset_password: { reset_password: string },
        @Request() request: any,
    ): Promise<{ newPassword: string }> {
        logger.info(`[resetPassword] from username '${getUserFromRequest(request)}'`);
        return new LoginService().resetPassword(reset_password.reset_password, getUserFromRequest(request));
    }
}
