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
});

export const UserAuthModelName = 'UserAuth';
export default mongoose.model<IUserAuth>(UserAuthModelName, UserAuthSchema);
