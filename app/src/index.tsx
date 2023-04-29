import ReactDOM from 'react-dom/client';
import './index.css';
import Home from './views/Home';
import NotFound from './views/NotFound';
import Login from './views/Login';
import User from './views/User';
import { AuthContext } from './context/authContext';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import React, { useState } from 'react';
import { type AuthResponse } from '@model/auth';

const router = createBrowserRouter(
    createRoutesFromElements(
        <>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/user/:username" element={<User />} />
            <Route path="*" element={<NotFound />} />
        </>,
    ),
);

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

function App(): JSX.Element {
    const [authState, setAuthState] = useState<AuthResponse | null>(null);

    return (
        <React.StrictMode>
            <AuthContext.Provider value={[authState, setAuthState]}>
                <RouterProvider router={router} />
            </AuthContext.Provider>
        </React.StrictMode>
    );
}

root.render(<App />);
