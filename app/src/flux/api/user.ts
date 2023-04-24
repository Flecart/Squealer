// This file contains all the api calls from the front end

// this should import the types in the api interface

export async function createUser(username: string, password: string): Promise<string> {
    console.log('api was called', username, password);
    return 'yes';
    // return await fetch('/api/auth/create', {
    //     method: 'POST',
    //     headers: {'Content-Type': 'application/json'},
    //     body: JSON.stringify({
    //         username: username,
    //         password: password,
    //     }),
    // }).then((res) => res.json());
}
