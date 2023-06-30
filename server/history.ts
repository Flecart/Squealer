// this file exports a function that is used to collect every interval
// all the historyEvents from the vip users
import UserModel from '@db/user';
import { UserRoles } from '@model/user';
import { HistoryService } from '@api/history/historyService';
import logger from '@server/logger';

const hourTime = 1000 * 60 * 60;

function msToNextHour() {
    return hourTime - (new Date().getTime() % hourTime);
}

export default async function collectEvents() {
    setTimeout(() => {
        beginIntervalUpdates();
    }, msToNextHour());
    logger.info('[history] set timeout for interval updates');
}

function beginIntervalUpdates() {
    setInterval(async () => {
        const vipUsers = await UserModel.find({ role: UserRoles.VIP });

        vipUsers.map((user) => {
            new HistoryService().updateHistory(user.username);
        });
    }, hourTime);
}
