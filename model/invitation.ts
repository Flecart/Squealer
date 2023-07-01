import type { PermissionType } from './channel';

export interface IInvitation {
    issuer: string;
    channel: string;
    permission: PermissionType;
    to: string;
}

export interface IInvitationRensponse {
    _id: string;
    issuer: string;
    channel: string;
    permission: PermissionType;
    to: string;
}
