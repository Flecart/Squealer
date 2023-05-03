import ReactDOM from 'react-dom/client';
import './scss/Global.scss';
import Home from './views/Home';
import NotFound from './views/NotFound';
import Login from './views/Login';
import User from './views/User';
import Logout from './views/Logout';
import Register from './views/Register';
import { AuthContext, ThemeContext } from './contexts';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import React, { useCallback, useEffect, useState } from 'react';
import { type AuthResponse } from '@model/auth';
import usePersistState from './hooks/usePersistState';

const router = createBrowserRouter(
    createRoutesFromElements(
        <>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/register" element={<Register />} />
            <Route path="/user/:username" element={<User />} />
            <Route path="*" element={<NotFound />} />
        </>,
    ),
);

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

function App(): JSX.Element {
    const [authState, setAuthState] = useState<AuthResponse | null>(null);
    const [themeState, setThemeState] = usePersistState<'light' | 'dark'>('theme', 'light');

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
