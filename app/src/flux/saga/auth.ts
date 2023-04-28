/* eslint-disable */
// TODO: fixare eslint per i sagas
import * as authApi from '@flux/api/auth';
import * as authAction from '@flux/actions/auth';
import { takeEvery, put, call } from 'redux-saga/effects';
import { type ActionType } from 'typesafe-actions';
import { type AuthRensponse } from '../../../../model/auth';

function* loginUser(action: ActionType<typeof authAction.loginUser>) {
    const data: AuthRensponse = yield call(authApi.loginUser, action.payload.username, action.payload.password);
    yield put(authAction.authParameter({ jwt: data.token, username: data.username })); // TODO: sostiutire con il nome dello user
    return data;
}
function* createUser(action: ActionType<typeof authAction.createUserAuth>) {
    const data: AuthRensponse = yield call(authApi.createUser, action.payload.display_name, action.payload.password);
    yield put(authAction.authParameter({ jwt: data.token, username: data.username })); // TODO: sostiutire con il nome dello user
    return data;
}

const userSagas = [takeEvery(authAction.createUserAuth, createUser), takeEvery(authAction.loginUser, loginUser)];

export default userSagas;
