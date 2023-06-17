import mongoose from 'mongoose';

export interface IUserAuth {
    username: string;
    password: string;
    salt: string;
    userId: mongoose.Types.ObjectId;
    suspended: boolean;
    enableReset: boolean;
    otp?: string;
}

export interface AuthResponse {
    username: string;
    token: string;
}
