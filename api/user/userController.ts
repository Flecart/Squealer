import {
    Security,
    Request,
    Get,
    Put,
    Post,
    Route,
    SuccessResponse,
    Controller,
    Path,
    Delete,
    Body,
    Query,
    Response,
    UploadedFile,
} from '@tsoa/runtime';
import UserService from './userService';
import { getUserFromRequest } from '@api/utils';
import { type IUser, type UserRoles } from '@model/user';
import { NotificationRensponse } from '@model/user';

import logger from '@server/logger';
import { ISuggestion, defaultSuggestionLimit } from '@model/channel';

import { UploadService } from '@api/upload/uploadService';
import { FILE_BASE } from '@config/api';
import { HttpError } from '@model/error';
import { AuthResponse } from '@model/auth';

const userLogger = logger.child({ label: 'user' });

@Route('/user')
export class UserController extends Controller {
    @Get('suggestions')
    @SuccessResponse(200, 'Suggestions Retrieved')
    public async getSuggestions(
        @Query('search') search: string,
        @Query('limit') limit?: number,
    ): Promise<ISuggestion[]> {
        userLogger.info(`getSuggestions for ${search}`);
        if (!limit) limit = defaultSuggestionLimit;
        return new UserService().getSuggestions(search, limit);
    }

    @Get('/notification')
    @Security('jwt')
    public async getNotifications(@Request() request: any): Promise<NotificationRensponse> {
        return await new UserService().getNotifications(getUserFromRequest(request));
    }

    @Delete('/notifications')
    @Security('jwt')
    public async deleteNotifications(@Request() request: any) {
        return new UserService().delNotifications(getUserFromRequest(request));
    }

    @Delete('/notification/{id}')
    @Security('jwt')
    public async deleteNotification(@Request() request: any, @Path() id: string) {
        return new UserService().delNotification(getUserFromRequest(request), id);
    }

    @Get()
    @Security('jwt')
    public async currentUser(@Request() request: any) {
        return new UserService().getUser(getUserFromRequest(request));
    }

    @Get('/invitations')
    @Security('jwt')
    public async getInvitations(@Request() request: any) {
        userLogger.info(`User ${getUserFromRequest(request)} get invitations`);
        return new UserService().getInvitations(getUserFromRequest(request));
    }

    @Get('{username}')
    public async getUser(@Path() username: string) {
        return new UserService().getUser(username);
    }

    @Delete('/delete')
    @Security('jwt')
    @SuccessResponse(201, 'User Deleted')
    public async deleteUser(@Request() request: any): Promise<any> {
        return new UserService().deleteUser(getUserFromRequest(request));
    }

    @Get('/quota')
    @Security('jwt')
    @SuccessResponse(200, 'Quota Retrieved')
    public async getQuota(@Request() request: any) {
        return new UserService().getQuota(getUserFromRequest(request));
    }

    @Put('/quota/buy')
    @Security('jwt')
    @SuccessResponse(200, 'Quota Purchased Successfully')
    public async buyQuota(
        @Request() request: any,
        @Body() q: { dailyQuote: number; weeklyQuote: number; monthlyQuote: number },
    ): Promise<any> {
        return new UserService().purchaseQuota(
            getUserFromRequest(request),
            q.dailyQuote,
            q.weeklyQuote,
            q.monthlyQuote,
        );
    }

    @Post('/role')
    @Security('jwt')
    @SuccessResponse(200, 'Role Updated')
    public async updateRole(@Request() request: any, @Body() role: { role: UserRoles }): Promise<IUser> {
        userLogger.info(`updateRole for user ${getUserFromRequest(request)} as ${role.role}`);
        return await new UserService().updateRole(getUserFromRequest(request), role.role);
    }

    @Put('/pay-debt')
    @Security('jwt')
    @SuccessResponse(200, 'Role Updated')
    public async payDebt(@Request() request: any): Promise<{ message: string }> {
        return await new UserService().payDebt(getUserFromRequest(request));
    }

    @Post('{username}/change-image')
    @Security('jwt')
    @Response<HttpError>(400, 'Bad request')
    @SuccessResponse<AuthResponse>(200, 'Image changed')
    public async changeImage(
        @Request() request: any,
        @UploadedFile('file') file?: Express.Multer.File,
    ): Promise<string> {
        userLogger.info(`[changeImage] with username '${getUserFromRequest(request)}'`);
        console.log(file);
        if (file == null) throw new HttpError(400, 'No file provided');
        const path = await new UploadService().uploadFile(file);
        return new UserService().changeImage(getUserFromRequest(request), `${FILE_BASE}/${path.path}`);
    }

    @Post('{username}/change-name')
    @Security('jwt')
    @Response<HttpError>(400, 'Bad request')
    @SuccessResponse<AuthResponse>(200, 'Username changed')
    public async changeUsername(
        @Body() new_username: { new_name: string },
        @Request() request: any,
    ): Promise<{ message: string }> {
        userLogger.info(`[changeUsername] with name '${getUserFromRequest(request)}'`);
        return new UserService().changeUsername(new_username.new_name, getUserFromRequest(request));
    }
}
