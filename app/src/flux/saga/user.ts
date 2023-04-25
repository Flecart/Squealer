import * as userApi from '@flux/api/user';
import * as userActions from '@flux/actions/user';
import { takeEvery, put, call } from 'redux-saga/effects';
import { type ActionType } from 'typesafe-actions';

function* createUser(action: ActionType<typeof userActions.createUser>) {
    const data: string = yield call(userApi.createUser, action.payload.name, action.payload.password);
    yield put(userActions.setUserName({ name: 'test' })); // TODO: sostiutire con il nome dello user
    console.log(data);
    return data;
}

const userSagas = [takeEvery(userActions.createUser, createUser)];

export default userSagas;
