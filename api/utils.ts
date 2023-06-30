import { HttpError } from '@model/error';
import { MessageCreation } from '@model/message';

export function getMaybeUserFromRequest(request: any): string | null {
    return request.user === null ? null : getUserFromRequest(request);
}
export function getUserFromRequest(request: any): string {
    // TODO: serebbe più clean se ritornasse il jwt token e non solo l'username credo
    return request.user['payload']['username'];
}

export function parseMessageCreationWithFile(stringRequest: string, file?: Express.Multer.File): MessageCreation {
    const bodyData: MessageCreation = JSON.parse(stringRequest);

    if (bodyData.content.type == 'image' || bodyData.content.type == 'video') {
        if (file == undefined) throw new HttpError(400, 'File attachment is undefined');
        else bodyData.content.data = file;
    }

    return bodyData;
}

// down here is used primarily for tests
export const baseUrl = 'http://localhost:8000';
export const apiUserCreate = '/api/auth/create';
export const apiUserLogin = '/api/auth/login';

export const apiUserGet = '/api/user';
export const apiUserQuota = '/api/user/quota';
