import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Home from './views/Home';
import NotFound from './views/NotFound';
import Login from './views/Login';
import { Provider } from 'react-redux';
import { Store } from '@flux/store';
<<<<<<< HEAD
import { User } from './views/User';
=======
import User from './views/User';
>>>>>>> fff6efb (feat(app): users page)

import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter(
    createRoutesFromElements(
        <>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
<<<<<<< HEAD
            <Route path="/user" element={<User />} />
=======
            <Route path="/user/:username" element={<User />} />
>>>>>>> fff6efb (feat(app): users page)
            <Route path="*" element={<NotFound />} />
        </>,
    ),
);

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <React.StrictMode>
        <Provider store={Store}>
            <RouterProvider router={router} />
        </Provider>
    </React.StrictMode>,
);
