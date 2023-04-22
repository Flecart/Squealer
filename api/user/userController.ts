import {Get, Post, Route} from "@tsoa/runtime";

// import {IUser} from "../../model/user";

@Route('/api/user')
export class UserController {
    
    @Post('')
    public async createUser() {
        return "todo";
    }
    
    @Get('/')
    getManagedClient(){

    } 

    // TODO: probabilmente le Quota sono da spostare in un controller sotto /api/user/Quota
    @Get('/quota')
    getQuota() {
        return "todo";
    }

    @Post('/quota/buy')
    buyQuota() {
        return "todo";
    }

    @Get('/quota/day')
    getDayQuota() {
        return "todo";
    }

    @Get('/quota/week')
    getWeekQuota() {
        return "todo";
    }

    @Get('/quota/month')
    getMonthQuota() {
        return "todo";
    }

}

