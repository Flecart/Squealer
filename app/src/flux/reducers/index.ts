import auth from '@flux/reducers/auth';
import display_user from '@flux/reducers/user';
import { combineReducers } from 'redux';

const rootReducer = combineReducers({
    auth,
    display_user,
});

export default rootReducer;
