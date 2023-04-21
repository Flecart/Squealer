import mongoose from "mongoose";

export interface IUser {
    username: string;
    password: string;
    role: "admin" | "pro" | "normal";
    channels: string[];
}

const UserSchema = new mongoose.Schema<IUser>({
    username: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    channels: { type: [String], required: true },
});

export default mongoose.model<IUser>("User", UserSchema);