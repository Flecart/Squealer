import mongoose from 'mongoose';
import logger from './logger';

const mongoLogger = logger.child({ label: 'mongo' });

export default function initConnection(): Promise<typeof mongoose> {
    mongoLogger.info('Connecting to mongo');
    if (process.env['MONGO_USER'] === 'flecart') {
        const mongoStringLocal = 'mongodb://root:example@localhost:27017/';
        mongoLogger.info(`detected local mongo setting by env-var, connecting to ${mongoStringLocal}`);
        return mongoose.connect(mongoStringLocal);
    }

    return mongoose.connect(
        `mongodb+srv://${process.env['MONGO_USER']}:${process.env['MONGO_PASS']}@${process.env['MONGO_DOMAIN']}.mongodb.net/`,
    );
}
