import mongoose from 'mongoose';
import { IUserAuth } from '@model/auth';

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
    suspended: {
        type: Boolean,
        default: false,
    enableReset: {
        type: Boolean,
        required: true,
    },
    otp: {
        type: String,
        required: false,
    },
});

export const UserAuthModelName = 'UserAuth';
export default mongoose.model<IUserAuth>(UserAuthModelName, UserAuthSchema);
