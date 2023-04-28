import { createSelector } from 'reselect';
import { type IStore } from '@flux/store';
import { type AuthStore } from '@flux/StoreInterfaces';

export const selectAuthStore = (state: IStore): AuthStore => state.auth;
export const getUserName = createSelector(selectAuthStore, (auth) => auth.username);
export const getJWT = createSelector(selectAuthStore, (auth) => auth.jwt);
export const getUser = createSelector(selectAuthStore, (auth) => auth.jwt);
