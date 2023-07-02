import mongoose from 'mongoose';
import UserModel from '@db/user';
import logger from './logger';
import GlobalModel from '@db/global';

const loggerQuota = logger.child({ label: 'updateQuota' });

enum UpdateCategory {
    Day,
    Week,
    Month,
    MonthAndWeek,
}

const millisecondsInSeconds = 1000;
const millisecondsInMinute = 60 * millisecondsInSeconds;
const millisecondsInHour = 60 * millisecondsInMinute;
const millisecondsInDay = 24 * millisecondsInHour;
const mondayDayCode = 1;
const monthDayCode = 1;

export async function periodicUpdateQuota(): Promise<void> {
    const global = await GlobalModel.find({});
    if (global.length == 0 || global[0] == undefined) {
        loggerQuota.info('First time update quota');
        createNewTimeout(0, updateCategory(new Date()));
    } else {
        loggerQuota.info('Update quota last update was ' + global[0].lastUpdate);
        const lastUpdate = global[0].lastUpdate;
        const next = nextUpdate(lastUpdate);
        const nextUpdateDate = new Date(new Date().getTime() + next);
        loggerQuota.info('Next update in ' + next + ' milliseconds');
        createNewTimeout(next, updateCategory(nextUpdateDate));
    }
}

function nextUpdate(oldDate: Date): number {
    const current_time = new Date();
    if (current_time.getDate() == oldDate.getDate()) {
        return millisecondsInDay - DateToMilliseconds(current_time);
    } else {
        return 0;
    }
}

function createNewTimeout(milliseconds: number, updateCat: UpdateCategory): void {
    setTimeout(async () => {
        await updateQuota(updateCat);
        await writeNextUpdate();
        const current_time = new Date();
        const nextUpdateMill = nextUpdate(current_time);
        const nextUpdateDate = new Date(current_time.getTime() + nextUpdateMill);
        loggerQuota.info('Next update in ' + nextUpdateMill + ' milliseconds');
        // it goes in recursion until the next day
        createNewTimeout(nextUpdateMill, updateCategory(nextUpdateDate));
    }, milliseconds);
}

async function writeNextUpdate(): Promise<void> {
    const current_time = new Date();
    await GlobalModel.deleteMany({});
    await GlobalModel.create({ lastUpdate: current_time });
    loggerQuota.info('Update "last update"');
}

function DateToMilliseconds(date: Date): number {
    return (
        date.getHours() * millisecondsInHour +
        date.getMinutes() * millisecondsInMinute +
        date.getSeconds() * millisecondsInSeconds
    );
}

async function updateQuota(category: UpdateCategory) {
    loggerQuota.info('Updating quota');
    const session = await mongoose.startSession();
    session.startTransaction();
    const users = await UserModel.find({});
    for (const user of users) {
        // because every time i call this funciton i want to reset the day quota
        user.usedQuota.day = 0;
        if (category == UpdateCategory.Week || category == UpdateCategory.MonthAndWeek) {
            user.usedQuota.week = 0;
        }
        if (category == UpdateCategory.Month || category == UpdateCategory.MonthAndWeek) {
            user.usedQuota.month = 0;
        }
        user.markModified('usedQuota');
        await user.save({ session: session });
    }
    try {
        await session.commitTransaction();
    } catch (err) {
        loggerQuota.error('Error updating quota');
        loggerQuota.error(err);
    }
    session.endSession();
    loggerQuota.info('Quota updated');
}

function updateCategory(date: Date): UpdateCategory {
    if (date.getDate() == 1 && date.getDay() == 1) {
        return UpdateCategory.MonthAndWeek;
    } else if (date.getDate() == monthDayCode) {
        return UpdateCategory.Month;
    } else if (date.getDay() == mondayDayCode) {
        return UpdateCategory.Week;
    } else {
        return UpdateCategory.Day;
    }
}
