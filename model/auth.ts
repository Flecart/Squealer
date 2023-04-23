import mongoose from "mongoose";
import { UserModelName } from "./user";

export interface IUserAuth {
    username: string;
    password: string;
    salt: string;
    role: "admin" | "pro" | "normal";
    userId: {
        type: mongoose.Schema.Types.ObjectId;
        ref: string;
    }
}

const UserAuthSchema = new mongoose.Schema({
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
    }
});

export default mongoose.model<IUserAuth>("UserAuth", UserAuthSchema);