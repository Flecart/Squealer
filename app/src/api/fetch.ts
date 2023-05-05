import { type AuthResponse } from '@model/auth';
import { HttpError } from '@model/error';

export async function fetchApi<T>(
    url: RequestInfo,
    init: RequestInit,
    auth: AuthResponse | null,
    success: (a: T) => void,
    error: (a: HttpError) => void,
): void {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');

    if (auth !== null) {
        headers.append('Authorization', 'Bearer ' + auth.token);
    }
    init.headers = headers;

    await fetch(url, init)
        .then(async (res) => {
            // TOOD: patterna match?
            if (res.status === 200 || res.status === 201) success((await res.json()) as T);
            else error((await res.json()) as HttpError);
        })
        .catch((e) => {
            console.log(e);
            error(new HttpError(1000, 'Network error'));
        });
}
