import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({
    path: "./.env",
});

export default function initConnection(): Promise<typeof mongoose> {
    return mongoose.connect(`mongodb+srv://${process.env["MONGO_USER"]}:${process.env["MONGO_PASS"]}@${process.env["MONGO_DOMAIN"]}.mongodb.net/`);
}