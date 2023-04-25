/* eslint-disable */
import { all } from 'redux-saga/effects';
import userSaga from '@flux/saga/user';

export default function* rootSaga() {
    yield all([...userSaga]);
}
