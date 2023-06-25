import fs from 'fs';
import mongoose from 'mongoose';
import UserModel from '@db/user';
import logger from './logger';

const loggerQuota = logger.child({ label: 'updateQuota' });

enum UpdateCategory {
    Day,
    Week,
    Month,
}

export async function periodicUpdateQuota(): Promise<void> {
    try {
        const data = await fs.promises.readFile('lastUpdate.json', 'utf8');
        loggerQuota.info('Reading lastUpdate.json');
        const json = JSON.parse(data);
        const lastUpdate = new Date(json.lastUpdate);
        const next = nextUpdate(lastUpdate);
        const nextUpdateDate = new Date(new Date().getTime() + next);
        createNewTimout(next, updateCategory(nextUpdateDate));
    } catch (err) {
        loggerQuota.error('Error writing lastUpdate.json');
        loggerQuota.error(err);
        createNewTimout(0, UpdateCategory.Month);
    }
}

function nextUpdate(oldDate: Date): number {
    const current_time = new Date();
    if (current_time.getDate() == oldDate.getDate()) {
        return 24 * 60 * 60 * 1000 - DateToMilliseconds(current_time);
    } else {
        return 0;
    }
}

function createNewTimout(milliseconds: number, updateCat: UpdateCategory): void {
    setTimeout(async () => {
        await updateQuota(updateCat);
        await writeNextUpdate();
        const current_time = new Date();
        const nextUpdateMill = nextUpdate(current_time);
        const nextUpdateDate = new Date(current_time.getTime() + nextUpdateMill);
        createNewTimout(nextUpdateMill, updateCategory(nextUpdateDate));
    }, milliseconds);
}

async function writeNextUpdate(): Promise<void> {
    try {
        await fs.promises.writeFile('lastUpdate.json', JSON.stringify({ lastUpdate: new Date() }));
        loggerQuota.info('lastUpdate.json written');
    } catch (err) {
        loggerQuota.error('Error writing lastUpdate.json');
        loggerQuota.error(err);
    }
}

function DateToMilliseconds(date: Date): number {
    return date.getHours() * 3600000 + date.getMinutes() * 60000 + date.getSeconds() * 1000;
}

async function updateQuota(category: UpdateCategory) {
    loggerQuota.info('Updating quota');
    const session = await mongoose.startSession();
    session.startTransaction();
    const users = await UserModel.find({});
    for (const user of users) {
        user.usedQuota.day = 0;
        if (category == UpdateCategory.Week || category == UpdateCategory.Month) {
            user.usedQuota.week = 0;
            if (category == UpdateCategory.Month) {
                user.usedQuota.month = 0;
            }
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
    if (date.getDate() == 1) {
        return UpdateCategory.Month;
    } else if (date.getDay() == 1) {
        return UpdateCategory.Week;
    } else {
        return UpdateCategory.Day;
    }
}
