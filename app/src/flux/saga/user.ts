/* eslint-disable */
// import * as userApi from '@flux/api/user';
import * as userAction from '@flux/actions/user';
import { takeEvery, put, call } from 'redux-saga/effects';
import { type ActionType } from 'typesafe-actions';
import { type IUser } from '../../../../model/user';

function* fetchUser(action: ActionType<typeof userAction.fetchUser>) {
    const data: IUser = yield call(userAction.fetchUser, { username: action.payload.username });
    yield put(userAction.setDisplayUser({ user: data })); // TODO: sostiutire con il nome dello user
    return data;
}

const userSagas = [takeEvery(userAction.fetchUser, fetchUser)];

export default userSagas;
