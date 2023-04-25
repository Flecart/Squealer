import { Security, Request, Get, Post, Route } from '@tsoa/runtime';
// import {IUser} from "../../model/user";
import UserService from './userService';

@Route('/user')
export class UserController {
    @Get()
    @Security('jwt')
    public async currentUser(@Request() request: any) {
        console.log(request.user);
        console.log(request);
        console.log(request.user['payload']['username']);
        return new UserService().getUser(request.user['payload']['username']);
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
