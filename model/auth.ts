import mongoose from 'mongoose';

export interface IUserAuth {
    username: string;
    password: string;
    salt: string;
    userId: mongoose.Types.ObjectId;
    suspended: boolean;
}

export interface AuthResponse {
    username: string;
    token: string;
}
