import ReactDOM from 'react-dom/client';
import './index.css';
import Home from './views/Home';
import NotFound from './views/NotFound';
import Login from './views/Login';
import User from './views/User';
import { type AuthParams, AuthContext, } from './context/authContext';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import React, { useState } from 'react';

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

 const [authState, setAuthState] = useState<AuthParams | null>(null);

root.render(
    <React.StrictMode>
        <AuthContext.Provider value={[authState, setAuthState]}>
            <RouterProvider router={router} />
        </AuthContext.Provider>
    </React.StrictMode>,
);
