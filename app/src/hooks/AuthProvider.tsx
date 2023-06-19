import { type AuthResponse } from '@model/auth';
import React, { type ReactNode } from 'react';
import { AuthContext } from 'src/contexts';
import usePersistState from 'src/hooks/usePersistState';
import { fetchApi } from 'src/api/fetch';
import { apiLogin } from 'src/api/routes';
import { type HttpError } from '@model/error';

export interface AuthContextType {
    authState: AuthResponse | null;
    onLogin: (username: string, password: string) => Promise<HttpError | null>;
    onLogout: () => void;
}

const makeLogin = async (username: string, password: string): Promise<AuthResponse> => {
    let authRes: AuthResponse | null = null;
    await fetchApi<AuthResponse>(
        apiLogin,
        {
            method: 'POST',
            body: JSON.stringify({
                username,
                password,
            }),
        },
        null,
        (auth) => {
            authRes = auth;
        },
        (error) => {
            throw error;
        },
    );

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return authRes!;
};

// https://blog.logrocket.com/using-react-children-prop-with-typescript/
interface Props {
    children: ReactNode;
}

export const AuthProvider = ({ children }: Props): JSX.Element => {
    const [authState, setAuthState] = usePersistState<AuthResponse | null>('auth', null);

    const handleLogin = async (username: string, password: string): Promise<HttpError | null> => {
        try {
            const token = await makeLogin(username, password);
            setAuthState(token);
        } catch (error) {
            return error as HttpError;
        }
        return null;
    };

    const handleLogout = (): void => {
        setAuthState(null);
    };

    const value = {
        authState,
        onLogin: handleLogin,
        onLogout: handleLogout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    return React.useContext(AuthContext) as AuthContextType;
};
