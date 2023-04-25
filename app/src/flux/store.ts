import createSagaMiddleware from 'redux-saga';
import { applyMiddleware, createStore } from 'redux';
import rootReducer from '@flux/reducers';
import rootSaga from '@flux/saga';

const sagaMiddleware = createSagaMiddleware();
export const Store = createStore(rootReducer, applyMiddleware(sagaMiddleware));

sagaMiddleware.run(rootSaga);
export type IStore = ReturnType<typeof rootReducer>;
