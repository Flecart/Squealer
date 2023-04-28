import * as authActions from '@flux/actions/auth';
import { type AuthStore } from '@flux/StoreInterfaces';
import { type ActionType, getType } from 'typesafe-actions';

export type AuthAtions = ActionType<typeof authActions>;

const defaultState: AuthStore = {
    username: '',
};

const authReducer = (state = defaultState, action: AuthAtions): AuthStore => {
    switch (action.type) {
        case getType(authActions.authParameter):
            return { ...state, username: action.payload.username, jwt: action.payload.jwt };
        default:
            return state;
    }
};

export default authReducer;
