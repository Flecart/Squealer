import mongoose from 'mongoose';
import logger from './logger';
import { MONGO_USER, MONGO_DOMAIN, MONGO_PASS } from '@config/config';

const mongoLogger = logger.child({ label: 'mongo' });

export default function initConnection(): Promise<typeof mongoose> {
    mongoLogger.info('Connecting to mongo');
    let connectionString = '';
    mongoLogger.info(`envUser: ${MONGO_USER}`);
    if (MONGO_USER === 'flecart') {
        connectionString = 'mongodb://root:example@localhost:27017/';
        mongoLogger.info(`detected local mongo setting by env-var, connecting to ${connectionString}`);
    } else if (MONGO_USER === 'site222307') {
        connectionString = `mongodb://${MONGO_USER}:${MONGO_PASS}@${MONGO_DOMAIN}?authSource=admin&writeConcern=majority`;
        mongoLogger.info(`detected university mongo setting by env-var, connecting to ${connectionString}`);
    } else {
        // connect to cloud instance
        connectionString = `mongodb+srv://${MONGO_USER}:${MONGO_PASS}@${MONGO_DOMAIN}.mongodb.net/`;
    }

    return mongoose.connect(connectionString);
}
