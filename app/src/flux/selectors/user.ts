import { createSelector } from 'reselect';
import { type IStore } from '@flux/store';
import { type UserStore } from '@flux/StoreInterfaces';

export const selectUserStore = (state: IStore): UserStore => state.user;
export const getUserName = createSelector(selectUserStore, (user) => user.name);
