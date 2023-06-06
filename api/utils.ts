export function getMaybeUserFromRequest(request: any): string | null {
    return request.user === null ? null : getUserFromRequest(request);
}
export function getUserFromRequest(request: any): string {
    // TODO: serebbe più clean se ritornasse il jwt token e non solo l'username credo
    return request.user['payload']['username'];
}

// down here is used primarily for tests
export const baseUrl = 'http://localhost:3000';
export const apiUserCreate = '/api/auth/create';
export const apiUserLogin = '/api/auth/login';

export const apiUserGet = '/api/user';
export const apiUserQuota = '/api/user/quota';
