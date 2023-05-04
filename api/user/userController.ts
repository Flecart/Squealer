import { Security, Request, Get, Post, Route, SuccessResponse, Controller, Path, Delete } from '@tsoa/runtime';
// import {IUser} from "../../model/user";
import UserService from './userService';
import { getUserFromRequest } from '@api/utils';

@Route('/user')
export class UserController extends Controller {
    @Get()
    @Security('jwt')
    public async currentUser(@Request() request: any) {
        return new UserService().getUser(getUserFromRequest(request));
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

    // TODO: probabilmente le Quota sono da spostare in un controller sotto /api/user/Quota
    @Get('/quota')
    @Security('jwt')
    @SuccessResponse(200, 'Quota Retrieved')
    public async getQuota(@Request() request: any) {
        return new UserService().getQuota(getUserFromRequest(request));
    }

    @Post('/quota/buy')
    buyQuota() {
        return 'todo';
    }

    @Get('/quota/day')
    getDayQuota() {
        return 'todo';
    }

    @Get('/quota/week')
    getWeekQuota() {
        return 'todo';
    }

    @Get('/quota/month')
    getMonthQuota() {
        return 'todo';
    }
}
