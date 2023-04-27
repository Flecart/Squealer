// This file contains all the api calls from the front end
import { type AuthRensponse } from '../../../../model/auth';
import { type HttpError } from '../../../../model/error';
import * as userSelector from '@flux/selectors/user';
import { Store } from '@flux/store';

async function fetchApi<T>(url: string, method: string, auth: boolean, body: object): Promise<T | HttpError> {
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

// this should import the types in the api interface
export async function loginUser(username: string, password: string): Promise<AuthRensponse | HttpError> {
    return await fetchApi<AuthRensponse>('/api/auth/login', 'POST', false, { username, password });
}

export async function createUser(username: string, password: string): Promise<AuthRensponse | HttpError> {
    return await fetchApi<AuthRensponse>('/api/auth/create', 'POST', false, { username, password });
}
