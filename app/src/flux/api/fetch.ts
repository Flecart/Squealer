import { Store } from '@flux/store';
import { type HttpError } from '../../../../model/error';
import * as userSelector from '@flux/selectors/user';

export async function fetchApi<T>(url: string, method: string, auth: boolean, body: object): Promise<T | HttpError> {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    const jwt = userSelector.getJWT(Store.getState());
    if (auth && jwt !== undefined) {
        headers.append('Authorization', 'Bearer ' + jwt);
    }
    return await fetch(url, {
        method: method !== '' ? method : 'GET',
        headers,
        body: JSON.stringify(body),
    }).then(async (res) => {
        if (res.status === 200) return (await res.json()) as T;
        return (await res.json()) as HttpError;
    });
}
