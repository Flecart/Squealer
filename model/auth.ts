import mongoose from 'mongoose';

export interface IUserAuth {
    username: string;
    password: string;
    salt: string;
    role: 'admin' | 'pro' | 'normal'; // TODO distinguere tra il social media manager e il moderator
    userId: mongoose.Types.ObjectId;
}

export interface AuthResponse {
    username: string;
    token: string;
}
