import { Alert, Button, Container, Spinner } from 'react-bootstrap';
import { useContext, useState } from 'react';
import { AuthContext } from '../contexts';
import { useNavigate } from 'react-router-dom';
import SidebarSearchLayout from 'src/layout/SidebarSearchLayout';
import { apiDelete as deleteEndpoint } from 'src/api/routes';
import { fetchApi } from 'src/api/fetch';

export default function Delete(): JSX.Element {
    const [authState, setAuthState] = useContext(AuthContext);
    const [pendingRequest, setPendingRequest] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    function handleDeleteUser(): void {
        setErrorMessage(null);

        if (!pendingRequest) {
            setPendingRequest(true);
            fetchApi<null>(
                deleteEndpoint,
                {
                    method: 'DELETE',
                    body: null,
                },
                authState,
                () => {
                    setAuthState(null);
                    navigate('/');
                },
                (error) => {
                    setErrorMessage(() => error.message);
                    setPendingRequest(false);
                },
            );
        }
    }

    return (
        <SidebarSearchLayout>
            <Container className="d-flex justify-content-center">
                <p>Vuoi davvero cancellare il tuo account? Questa azione è irreversibile!</p>
                <Button variant="danger" onClick={handleDeleteUser}>
                    Elimina Account
                </Button>
                <Container>
                    {pendingRequest && (
                        <>
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Cancellazione...</span>
                            </Spinner>
                        </>
                    )}
                    {errorMessage !== null && <Alert variant="danger">{errorMessage}</Alert>}
                </Container>
            </Container>
        </SidebarSearchLayout>
    );
}
