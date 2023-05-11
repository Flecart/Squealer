import { Alert, Button, Container, Form, FormGroup, Spinner } from 'react-bootstrap';
import React, { useCallback, useContext, useState } from 'react';
import { AuthContext } from '../contexts';
import { fetchApi } from '../api/fetch';
import { apiAuthUserBase } from 'src/api/routes';
import { useNavigate } from 'react-router-dom';
import SidebarSearchLayout from '../layout/SidebarSearchLayout';

export default function ChangeUsername(): JSX.Element {
    const navigate = useNavigate();

    const [authState] = useContext(AuthContext);

    const [newUsername, setNewUsername] = useState('');

    const [pendingRequest, setPendingRequest] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleChangeUsername = useCallback(
        (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            setErrorMessage(null);
            setNewUsername('');

            if (!pendingRequest) {
                if (authState == null) return;
                setPendingRequest(true);
                fetchApi<null>(
                    `${apiAuthUserBase}/${authState?.username}/change-username`,
                    {
                        method: 'POST',
                        body: JSON.stringify({
                            new_username: newUsername,
                        }),
                    },
                    authState,
                    () => {
                        navigate(`/user/${newUsername}`);
                    },
                    (error) => {
                        setErrorMessage(() => error.message);
                        setPendingRequest(false);
                    },
                );
            }
        },
        [newUsername],
    );

    return (
        <SidebarSearchLayout>
            <Container className="d-flex justify-content-center">
                <Form className="m-0 me-4 py-3 px-3 border" onSubmit={handleChangeUsername}>
                    <FormGroup className="mb-3">
                        <Form.Label className="text-light">New Username</Form.Label>
                        <Form.Control
                            type="text"
                            value={newUsername}
                            onChange={(e) => {
                                setNewUsername(e.target.value);
                            }}
                            placeholder="Inserisci la tuo nuovo username"
                        />
                    </FormGroup>
                    <Container className="d-flex justify-content-center">
                        <Button className="col-6 me-1" variant="outline-success" type="submit">
                            Modifica Username
                        </Button>
                    </Container>
                    <Container className="d-flex justify-content-center">
                        {errorMessage !== null && <Alert variant="danger">{errorMessage}</Alert>}
                        {pendingRequest && (
                            <>
                                <Spinner animation="border" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </Spinner>
                            </>
                        )}
                    </Container>
                </Form>
            </Container>
        </SidebarSearchLayout>
    );
}
