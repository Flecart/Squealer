import mongoose from 'mongoose';
import { PermissionType } from './channel';

export interface IInvitation {
    _id: mongoose.Types.ObjectId;
    issuer: string;
    channel: string;
    permission: PermissionType;
    to: string;
}
