// This file contains all the api calls from the front end
import { type HttpError } from '../../../../model/error';
import { fetchApi } from './fetch';
import { type IUser } from '../../../../model/user';

export async function getUser(username: string): Promise<IUser | HttpError> {
    return await fetchApi<IUser>(`/api/user/${username}`, 'GET', true, {});
}
