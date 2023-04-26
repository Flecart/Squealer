import * as userActions from '@flux/actions/user';
import { type UserStore } from '@flux/StoreInterfaces';
import { type ActionType, getType } from 'typesafe-actions';

export type UserAction = ActionType<typeof userActions>;

const defaultState: UserStore = {
    username: '',
};

const userReducer = (state = defaultState, action: UserAction): UserStore => {
    switch (action.type) {
        case getType(userActions.authParameter):
            return { ...state, username: action.payload.username, jwt: action.payload.jwt };
        default:
            return state;
    }
};

export default userReducer;
