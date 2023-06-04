export function getMaybeUserFromRequest(request: any): string | null {
    return request.user === null ? null : getUserFromRequest(request);
}
export function getUserFromRequest(request: any): string {
    // TODO: serebbe più clean se ritornasse il jwt token e non solo l'username credo
    return request.user['payload']['username'];
}
