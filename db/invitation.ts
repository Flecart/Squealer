import { IInvitation } from '@model/invitation';
import mongoose from 'mongoose';

export const InvitationSchema = new mongoose.Schema<IInvitation>({
    issuer: { type: String, required: true },
    channel: { type: String, required: true },
    permission: { type: String, required: true },
    to: { type: String, required: true },
});

export default mongoose.model<IInvitation>('Invitation', InvitationSchema);
