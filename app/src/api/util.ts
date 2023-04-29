import { HttpError } from '../../../model/error';

interface ApiSuccess<T> {
    type: 'success';
    data: T;
}

interface ApiError {
    type: 'error';
    error: HttpError;
}

export type ApiResult<T> = ApiSuccess<T> | ApiError;

export function getData<T>(res: ApiResult<T>): T | null {
    if (isApiSuccess(res)) {
        return res.data;
    }
    return null;
}

export function getError<T>(res: ApiResult<T>): HttpError | null {
    if (isApiError(res)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return res.error;
    }
    return null;
}

export function makeApiResult<T>(data: T | HttpError): ApiResult<T> {
    if (data instanceof HttpError) {
        return makeApiError(data);
    }
    return makeApiSuccess(data);
}

function isApiSuccess<T>(res: ApiResult<T>): res is { type: 'success'; data: T } {
    return res.type === 'success';
}

function isApiError<T>(res: ApiResult<T>): res is { type: 'error'; error: HttpError } {
    return res.type === 'error';
}
function makeApiSuccess<T>(data: T): ApiSuccess<T> {
    return {
        type: 'success',
        data,
    };
}

function makeApiError(error: HttpError): ApiError {
    return {
        type: 'error',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        error,
    };
}
