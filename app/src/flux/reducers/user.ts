import * as userActions from '@flux/actions/user';
import { UserStore } from '@flux/StoreInterfaces';
import { ActionType, getType } from 'typesafe-actions';

export type GameAction = ActionType<typeof userActions>;

const defaultState: UserStore = {
    name: '',
};

const userReducer = (state = defaultState, action: GameAction) => {
    switch (action.type) {
        case getType(userActions.setUserName):
            return { ...state, name: action.payload.name };
        default:
            return state;
    }
};

export default userReducer;
