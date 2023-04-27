// This file contains all the api calls from the front end
import { type AuthRensponse } from '../../../../model/auth';
import { HttpError } from '../../../../model/error';
import { fetchApi } from './fetch';

// this should import the types in the api interface
export async function loginUser(username: string, password: string): Promise<AuthRensponse | HttpError> {
    return await fetchApi<AuthRensponse>('/api/auth/login', 'POST', false, { username, password });
}

export async function createUser(username: string, password: string): Promise<AuthRensponse | HttpError> {
    return await fetchApi<AuthRensponse>('/api/auth/create', 'POST', false, { username, password });
}
