import './scss/Global.scss';
import Home from './views/Home';
import NotFound from './views/NotFound';
import Login from './views/Login';
import User from './views/User';
import Logout from './views/Logout';
import Register from './views/Register';
import { AuthContext } from './contexts';
import { createBrowserRouter, createRoutesFromElements, Navigate, Route } from 'react-router-dom';
import { useContext } from 'react';
import AddPost from './views/AddPost';
import Message from './views/Message';
import Settings from './views/Settings';
import Channel from './views/Channel';
import Notification from './views/Notification';
import { CreateChannel } from './views/CreateChannel';
import SearchPage from './views/SearchPage';
import Channels from './views/Channels';
import Reset from './views/Reset';

interface Props {
    children: JSX.Element;
}

const ProtectedRoute = ({ children }: Props): JSX.Element => {
    const [authState, setAuth] = useContext(AuthContext);

    const isTokenExpired = (token: string): boolean => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        return Date.now() >= JSON.parse(window.atob(token.split('.')[1] as string)).exp * 1000;
    };

    if (authState === null || isTokenExpired(authState.token)) {
        setAuth(null);
        return <Navigate to="/login" replace />;
    }

    return children;
};

const router = createBrowserRouter(
    createRoutesFromElements(
        <>
            <Route path="/" element={<Home />} />
            <Route
                path="/search"
                element={
                    <ProtectedRoute>
                        <SearchPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/settings"
                element={
                    <ProtectedRoute>
                        <Settings />
                    </ProtectedRoute>
                }
            />
            <Route path="/channels" element={<Channels />} />
            <Route path="/login" element={<Login />} />
            <Route
                path="/logout"
                element={
                    <ProtectedRoute>
                        <Logout />
                    </ProtectedRoute>
                }
            />
            <Route path="/create" element={<Register />} />
            <Route
                path="/createChannel"
                element={
                    <ProtectedRoute>
                        <CreateChannel />
                    </ProtectedRoute>
                }
            />
            <Route path="/user/:username" element={<User />} />
            <Route path="/recover" element={<Reset />} />
            <Route path="*" element={<NotFound />} />
            <Route
                path="/addpost/"
                element={
                    <ProtectedRoute>
                        <AddPost />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/addpost/:parent"
                element={
                    <ProtectedRoute>
                        <AddPost />
                    </ProtectedRoute>
                }
            />
            <Route path="/message/:id" element={<Message />} />
            <Route path="/channel/" element={<Channel />} />
            <Route path="/channel/:channelId" element={<Channel />} />
            <Route
                path="/notification"
                element={
                    <ProtectedRoute>
                        <Notification />
                    </ProtectedRoute>
                }
            />
        </>,
    ),
);

export default router;
