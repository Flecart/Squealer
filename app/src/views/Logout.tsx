import { Button, Container } from 'react-bootstrap';
import { useContext } from 'react';
import { AuthContext } from '../contexts';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SidebarSearchLayout from 'src/layout/SidebarSearchLayout';

export default function Logout(): JSX.Element {
    const [authState, setAuthState] = useContext(AuthContext);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    function handleLogout(): void {
        setAuthState(null);
        const redirect = searchParams.get('redirect');
        if (redirect !== null) {
            window.location.href = redirect;
        }
    }

    return (
        <SidebarSearchLayout>
            <Container className="d-flex text-center flex-column justify-content-center p-4">
                {authState === null ? (
                    <Container>
                        <h3>Non sei loggato</h3>
                        <Button
                            onClick={() => {
                                navigate('/login');
                            }}
                        >
                            Login
                        </Button>
                    </Container>
                ) : (
                    <Container className="d-flex text-center flex-column justify-content-center p-4">
                        <h3>Attualmente sei loggato come {authState?.username}</h3>
                        <Button onClick={handleLogout}>LogOut</Button>
                    </Container>
                )}
            </Container>
        </SidebarSearchLayout>
    );
}
