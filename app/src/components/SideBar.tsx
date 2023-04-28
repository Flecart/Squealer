import { Navbar, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export function SideBar(): JSX.Element {
    return (
        <Navbar className="d-none d-lg-flex flex-column align-items-start ps-3" sticky="top">
            <Link to="#">
                <Button className="rounded" variant="dark">
                    Esplora
                </Button>
            </Link>
            <Link to="#">
                <Button className="rounded" variant="dark">
                    Impostazioni
                </Button>
            </Link>
            <Link to="/login">
                <Button className="rounded" variant="dark">
                    Login
                </Button>
            </Link>
        </Navbar>
    );
}
