/* eslint-disable */
// TODO: fixare eslint per i sagas
import * as userApi from '@flux/api/user';
import * as userActions from '@flux/actions/user';
import { takeEvery, put, call } from 'redux-saga/effects';
import { type ActionType } from 'typesafe-actions';
import { type AuthRensponse } from '../../../../model/auth';

function* loginUser(action: ActionType<typeof userActions.loginUser>) {
    const data: AuthRensponse = yield call(userApi.loginUser, action.payload.username, action.payload.password);
    yield put(userActions.authParameter({ jwt: data.token, username: data.username })); // TODO: sostiutire con il nome dello user
    return data;
}
function* createUser(action: ActionType<typeof userActions.createUser>) {
    const data: AuthRensponse = yield call(userApi.createUser, action.payload.display_name, action.payload.password);
    yield put(userActions.authParameter({ jwt: data.token, username: data.username })); // TODO: sostiutire con il nome dello user
    return data;
}

const userSagas = [takeEvery(userActions.createUser, createUser), takeEvery(userActions.loginUser, loginUser)];

export default userSagas;
