import type * as userActions from '@flux/actions/user';
// import { type UserStore } from '@flux/StoreInterfaces';
import { getType, type ActionType } from 'typesafe-actions';
import { type IUser } from '../../../../model/user';

export type UserActions = ActionType<typeof userActions>;

const defaultState: IUser | undefined = undefined;

const userReducer = (state = defaultState, action: UserActions): IUser | undefined => {
    switch (action.type) {
        case getType(userActions.setDisplayUser):
            return action.payload.user;
        default:
            return state;
    }
};

export default userReducer;
