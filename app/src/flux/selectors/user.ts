// import { createSelector } from 'reselect';
import { type IStore } from '@flux/store';
import { type IUser } from '../../../../model/user';

export const selectDisplayUser = (state: IStore): IUser => state.display_user;
