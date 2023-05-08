import ReactDOM from 'react-dom/client';
import './scss/Global.scss';
import Home from './views/Home';
import NotFound from './views/NotFound';
import Login from './views/Login';
import User from './views/User';
import Logout from './views/Logout';
import Register from './views/Register';
import Delete from './views/Delete';
import ChangePassword from './views/ChangePassword';
import ChangeUsername from './views/ChangeUsername';
import { AuthContext, ThemeContext } from './contexts';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import React, { useCallback, useEffect, useState } from 'react';
import { type AuthResponse } from '@model/auth';
import usePersistState from './hooks/usePersistState';
import AddPost from './views/AddPost';
import Message from './views/Message';
import Settings from './views/Settings';
import Channel from './views/Channel';

const router = createBrowserRouter(
    createRoutesFromElements(
        <>
            <Route path="/" element={<Home />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/create" element={<Register />} />
            <Route path="/user/:username" element={<User />} />
            <Route path="/user/:username/change-password" element={<ChangePassword />} />
            <Route path="/user/:username/change-username" element={<ChangeUsername />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/user/delete" element={<Delete />} />
            <Route path="/addpost/" element={<AddPost />} />
            <Route path="/addpost/:parent" element={<AddPost />} />
            <Route path="/message/:id" element={<Message />} />
            <Route path="/channel/:channelId" element={<Channel />} />
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
