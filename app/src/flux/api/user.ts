// This file contains all the api calls from the front end

// this should import the types in the api interface

export async function createUser(username: string, password: string): Promise<string> {
    return await fetch('/api/auth/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username,
            password,
        }),
    }).then(async (res) => {
        return (await res.json()) as unknown as string; // TODO: settare il tipo di ritorno corretto, dipende dall'API.
    });
}
