import { Navbar, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useContext } from 'react';

import { AuthContext } from '../context/authContext';

export function SideBar(): JSX.Element {
    const [authState] = useContext(AuthContext);

    function toggleTheme(): void {
        if (document.documentElement.getAttribute('data-bs-theme') === 'dark')
            document.documentElement.setAttribute('data-bs-theme', 'light');
        else document.documentElement.setAttribute('data-bs-theme', 'dark');
    }

    return (
        <Navbar className="d-none d-lg-flex flex-column align-items-start ps-3" sticky="top">
            <Link to="#">
                <Button className="rounded">Esplora</Button>
            </Link>
            <Link to="#">
                <Button className="rounded">Impostazioni</Button>
            </Link>
            {authState == null && (
                <Link to="/login">
                    <Button className="rounded">Login</Button>
                </Link>
            )}
            <Button className="rounded" onClick={toggleTheme}>
                Troggle theme
            </Button>
        </Navbar>
    );
}
