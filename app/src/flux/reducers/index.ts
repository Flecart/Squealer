import user from '@flux/reducers/user';
import { combineReducers } from 'redux';

const rootReducer = combineReducers({
    user,
});

export default rootReducer;
