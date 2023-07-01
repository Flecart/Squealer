import ReactDOM from 'react-dom/client';
import './scss/Global.scss';
import './scss/App.scss';
import { AuthContext, ThemeContext } from './contexts';
import { RouterProvider } from 'react-router-dom';
import React, { useCallback, useEffect } from 'react';
import { type AuthResponse } from '@model/auth';
import usePersistState from './hooks/usePersistState';
import { fetchApi } from './api/fetch';
import { apiUserNotification } from './api/routes';
import { NotificationStore } from './notification';
import router from './router';
import { type NotificationRensponse } from '@model/user';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

function App(): JSX.Element {
    const [authState, setAuthState] = usePersistState<AuthResponse | null>('auth', null);
    const [themeState, setThemeState] = usePersistState<'light' | 'dark'>('theme', 'light');

    useEffect((): (() => void) => {
        if (authState !== null) {
            const getNotification = (): void => {
                fetchApi<NotificationRensponse>(
                    apiUserNotification,
                    { method: 'GET' },
                    authState,
                    (messages) => {
                        NotificationStore.setNotification(messages);
                    },
                    (error) => {
                        // attuale specifica 401 è quando non abbiamo auth.
                        if (error.status === 401) {
                            setAuthState(null);
                        }
                    },
                );
            };

            getNotification();
            const interval = setInterval(getNotification, 10000);
            return () => {
                clearInterval(interval);
            };
        }
        return () => {};
    }, [authState]);

    useEffect(() => {
        document.documentElement.setAttribute('data-bs-theme', themeState);
    }, [themeState]);

    const toggleTheme = useCallback(() => {
        if (themeState === 'dark') setThemeState('light');
        else setThemeState('dark');
    }, [themeState]);

    return (
        <React.StrictMode>
            <AuthContext.Provider value={[authState, setAuthState]}>
                <ThemeContext.Provider value={[themeState, toggleTheme]}>
                    <RouterProvider router={router} />
                </ThemeContext.Provider>
            </AuthContext.Provider>
        </React.StrictMode>
    );
}

root.render(<App />);
