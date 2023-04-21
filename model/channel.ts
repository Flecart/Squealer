import mongoose from "mongoose";

export interface IChannel {
    name: string;
    description: string;
    private: boolean;
    members: string[];
    messages: string[];
}

const ChannelSchema = new mongoose.Schema<IChannel>({
    name: { type: String, required: true },
    description: { type: String, required: false },
    private: { type: Boolean, required: true },
    members: { type: [String], required: true },
    messages: { type: [String], required: true },
});

export default mongoose.model<IChannel>("Channel", ChannelSchema);