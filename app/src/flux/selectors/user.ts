import { createSelector } from 'reselect';
import { IStore } from '@flux/store';

export const selectUserStore = (state: IStore) => state.user;
export const getUserName = createSelector(selectUserStore, (user) => user.name);
