import { Container, Stack } from 'react-bootstrap';
import { useContext } from 'react';
import { AuthContext } from '../contexts';
import { Link } from 'react-router-dom';
import SidebarSearchLayout from 'src/layout/SidebarSearchLayout';

export default function Settings(): JSX.Element {
    const [authState] = useContext(AuthContext);

    return (
        <SidebarSearchLayout>
            <Container className="d-flex justify-content-center">
                {authState !== null ? (
                    <Stack className="d-flex rounded border p-2">
                        <Link to={`/user/${authState.username}/change-password`}>Modifica Password</Link>
                        <Link to={`/user/${authState.username}/change-username`}>Modifica Username</Link>
                        <Link to="user/reset">Reset</Link>
                        <Link to="/user/delete" className="text-danger">
                            Clicca qui per eliminare account
                        </Link>
                    </Stack>
                ) : (
                    <Container>Cose Da Aggiungere</Container>
                )}
            </Container>
        </SidebarSearchLayout>
    );
}
