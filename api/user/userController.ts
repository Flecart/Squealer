import { Security, Request, Get, Post, Route } from '@tsoa/runtime';

// import {IUser} from "../../model/user";

@Route('/user')
export class UserController {
    @Get()
    @Security('jwt')
    public async currentUser(@Request() request: any) {
        console.log(request);
        return 'todo';
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
