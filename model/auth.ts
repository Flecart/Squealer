import mongoose from 'mongoose';

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
});

export const UserAuthModelName = 'UserAuth';
export default mongoose.model<IUserAuth>(UserAuthModelName, UserAuthSchema);

export interface AuthResponse {
    username: string;
    token: string;
}
