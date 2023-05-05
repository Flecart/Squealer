import { Navbar, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useContext } from 'react';

import { AuthContext } from '../contexts';

export function SideBar(): JSX.Element {
    const [authState] = useContext(AuthContext);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars

    return (
        <Navbar className="d-none d-lg-flex flex-column align-items-start ps-3" sticky="top">
            <Link to="#">
                <Button className="rounded">Esplora</Button>
            </Link>
            <Link to="/setting">
                <Button className="rounded">Impostazioni</Button>
            </Link>
            {authState !== null ? (
                <>
                    <Link to="/logout">
                        <Button className="rounded">Logout</Button>
                    </Link>
                    <Link to={`/user/${authState.username}`}>
                        <Button className="rounded">Me</Button>
                    </Link>
                </>
            ) : (
                <Link to="/login">
                    <Button className="rounded">Login</Button>
                </Link>
            )}
        </Navbar>
    );
}
