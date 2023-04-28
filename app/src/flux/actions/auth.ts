import { createAction } from 'typesafe-actions';

export const createUserAuth = createAction('auth/create_user')<{ display_name: string; password: string }>();
export const loginUser = createAction('auth/login')<{ username: string; password: string }>();
export const authParameter = createAction('auth/set_auth_Parameter')<{ username: string; jwt: string }>();
