import { Security, Request, Get, Post, Route ,Path} from '@tsoa/runtime';
// import {IUser} from "../../model/user";
import UserService from './userService';

@Route('/user')
export class UserController {
    @Get()
    @Security('jwt')
    public async currentUser(@Request() request: any) {
        return new UserService().getUser(request.user['payload']['username']);
    }

    @Get('{username}')
    public async getUser(@Path() username: string) {
        return new UserService().getUser(username);
    }

    // TODO: probabilmente le Quota sono da spostare in un controller sotto /api/user/Quota
    @Get('/quota')
    getQuota() {
        return 'todo';
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
