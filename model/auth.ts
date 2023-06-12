import mongoose from 'mongoose';

export interface IUserAuth {
    username: string;
    password: string;
    salt: string;
    userId: mongoose.Types.ObjectId;
    resetQuestion?: string;
    resetPassword?: string;
}

export interface AuthResponse {
    username: string;
    token: string;
}
