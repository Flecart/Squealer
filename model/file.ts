import mongoose from 'mongoose';

export interface IFile {
    name: string;
    size: number;
    mimetype: string;
    buffer: Buffer;
}

const FileSchema = new mongoose.Schema<IFile>({
    name: {
        type: String,
        required: true,
    },
    size: {
        type: Number,
        required: true,
    },
    mimetype: {
        type: String,
        required: true,
    },
    buffer: {
        type: Buffer,
        required: true,
    },
});

export const FileModelName = 'FileStorage';
export default mongoose.model<IFile>(FileModelName, FileSchema);
