import { Alert, Button, Container, Spinner } from 'react-bootstrap';
import { useContext, useState } from 'react';
import { AuthContext } from '../contexts';
import { useNavigate } from 'react-router-dom';
import { apiDelete as deleteEndpoint } from 'src/api/routes';
import { fetchApi } from 'src/api/fetch';

export default function DeleteAccount(): JSX.Element {
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
        <Container className="container-form-bs">
            <h4 className="subtitle-form-bs">
                Do you really want delete your account?
                <br />
                This action is irreversible!
            </h4>
            <Button variant="danger" onClick={handleDeleteUser}>
                Delete Account
            </Button>
            {pendingRequest && (
                <Spinner className="spinner-form-bs" animation="border" role="status">
                    <span className="visually-hidden">Deleting...</span>
                </Spinner>
            )}
            {errorMessage !== null && (
                <Alert className="alert-form-bs" variant="danger">
                    {errorMessage}
                </Alert>
            )}
        </Container>
    );
}
