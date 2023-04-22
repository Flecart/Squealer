import mongoose from "mongoose";

export interface IUser {
    username: string;
    password: string;
    role: "admin" | "pro" | "normal";
    channels: string[];
    day_quote: number; 
    month_quote: number; 
    week_quote: number; 
    clients?:string[];
}


const UserSchema = new mongoose.Schema<IUser>({
    username: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    channels: { type: [String], required: true },
    day_quote: { type: Number, required: true },
    month_quote: { type: Number, required: true },
    week_quote: { type: Number, required: true },
    clients: { type: [String], required: false },
});

export default mongoose.model<IUser>("User", UserSchema);