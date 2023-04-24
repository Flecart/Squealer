import { createAction } from 'typesafe-actions';

export const createUser = createAction('user/create_user')<{ name: string; password: string }>();
export const setUserName = createAction('user/set_user_name')<{ name: string }>();
