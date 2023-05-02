import { Alert, Button, Container } from 'react-bootstrap';
import { useContext } from 'react';
import { AuthContext } from '../contexts';
import { useNavigate } from 'react-router-dom';
import SidebarSearchLayout from 'src/layout/SidebarSearchLayout';
export default function Logout(): JSX.Element {
    const [authState, setAuthState] = useContext(AuthContext);
    const navigate = useNavigate();

    function handleLogout(): void {
        setAuthState(null);
    }

    return (
        <>
            <SidebarSearchLayout>
                <Container className="d-flex justify-content-center">
                    {authState === null && (
                        <Container>
                            <Alert variant="danger">Non sei loggato</Alert>
                            <Button
                                onClick={() => {
                                    navigate('/login');
                                }}
                            >
                                LogOut
                            </Button>
                        </Container>
                    )}
                    {authState !== null && (
                        <Container className="d-flex justify-content-center">
                            <Alert variant="light">Attualmente sei loggato come {authState?.username}</Alert>
                            <Button onClick={handleLogout}>LogOut</Button>
                        </Container>
                    )}
                </Container>
            </SidebarSearchLayout>
        </>
    );
}
