import { createAction } from 'typesafe-actions';
import { type IUser } from '../../../../model/user';

export const fetchUser = createAction('user/fetch_user')<{ username: string }>();
export const setDisplayUser = createAction('user/fetch_display_user')<{ user: IUser }>();
