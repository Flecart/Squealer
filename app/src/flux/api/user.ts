// This file contains all the api calls from the front end
import { type AuthRensponse } from '../../../../model/auth';

// this should import the types in the api interface
export async function loginUser(username: string, password: string): Promise<AuthRensponse> {
    return await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username,
            password,
        }),
    }).then(async (res) => {
        return (await res.json()) as AuthRensponse; // TODO: settare il tipo di ritorno corretto, dipende dall'API.
    });
}

export async function createUser(username: string, password: string): Promise<AuthRensponse> {
    return await fetch('/api/auth/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username,
            password,
        }),
    }).then(async (res) => {
        return (await res.json()) as AuthRensponse; // TODO: settare il tipo di ritorno corretto, dipende dall'API.
    });
}
