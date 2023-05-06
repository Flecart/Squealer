import mongoose from 'mongoose';

export interface IFile {
    name: string;
    size: number;
    mimetype: string;
}

const FileSchema = new mongoose.Schema<IFile>({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    size: {
        type: Number,
        required: true,
    },
    mimetype: {
        type: String,
        required: true,
    },
});

export const FileModelName = 'FileStorage';
export default mongoose.model<IFile>(FileModelName, FileSchema);
