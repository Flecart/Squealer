import mongoose from 'mongoose';

export default function initConnection(): Promise<typeof mongoose> {
    // TODO: cambia questo quando fai deploy sul pc di unibo
    console.log('MONGO USER: ', process.env['MONGO_USER']);
    /* if (process.env['MONGO_USER'] === 'flecart') {
        console.log('Connecting to local mongo');
        return mongoose.connect('mongodb://root:example@localhost:27017/');
    } */

    return mongoose.connect(
        `mongodb+srv://${process.env['MONGO_USER']}:${process.env['MONGO_PASS']}@${process.env['MONGO_DOMAIN']}.mongodb.net/`,
    );
}
