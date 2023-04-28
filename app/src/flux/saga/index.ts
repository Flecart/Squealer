/* eslint-disable */
import { all } from 'redux-saga/effects';
import userSaga from '@flux/saga/auth';

export default function* rootSaga() {
    yield all([...userSaga]);
}
