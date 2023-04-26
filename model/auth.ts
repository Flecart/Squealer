import mongoose from 'mongoose';
import { UserModelName } from './user';

export interface IUserAuth {
    username: string;
    password: string;
    salt: string;
    role: 'admin' | 'pro' | 'normal'; // TODO distinguere tra il social media manager e il moderator
    userId: mongoose.Types.ObjectId;
}

const UserAuthSchema = new mongoose.Schema<IUserAuth>({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    salt: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: UserModelName,
        required: true,
    },
});

export default mongoose.model<IUserAuth>('UserAuth', UserAuthSchema);

export interface AuthRensponse {
    username: string;
    token: string;
}
