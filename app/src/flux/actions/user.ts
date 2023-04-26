import { createAction } from 'typesafe-actions';

export const createUser = createAction('user/create_user')<{ display_name: string; password: string }>();
export const loginUser = createAction('user/login')<{ username: string; password: string }>();
export const authParameter = createAction('user/set_auth_Parameter')<{ username: string; jwt: string }>();
