import { Alert, Button, Container, Form, FormGroup, Spinner } from 'react-bootstrap';
import React, { useCallback, useContext, useState } from 'react';
import { AuthContext } from '../contexts';
import { fetchApi } from '../api/fetch';
import { apiAuthUserBase } from 'src/api/routes';

export default function ChangePassword(): JSX.Element {
    const [authState] = useContext(AuthContext);

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const [pendingRequest, setPendingRequest] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleChangePassword = useCallback(
        (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            setErrorMessage(null);
            setOldPassword('');
            setNewPassword('');

            if (!pendingRequest) {
                if (authState == null) return;
                setPendingRequest(true);
                fetchApi<null>(
                    `${apiAuthUserBase}/${authState?.username}/change-password`,
                    {
                        method: 'POST',
                        body: JSON.stringify({
                            old_password: oldPassword,
                            new_password: newPassword,
                        }),
                    },
                    authState,
                    () => {
                        setSuccessMessage('Password Modificata Con Successo');
                        setPendingRequest(false);
                    },
                    (error) => {
                        setErrorMessage(() => error.message);
                        setPendingRequest(false);
                    },
                );
            }
        },
        [oldPassword, newPassword],
    );

    return (
        <Form className="m-0 me-4 py-3 px-3 " onSubmit={handleChangePassword}>
            <FormGroup className="mb-3">
                <Form.Label className="text-light">Old Password</Form.Label>
                <Form.Control
                    type="text"
                    value={oldPassword}
                    onChange={(e) => {
                        setOldPassword(e.target.value);
                    }}
                    placeholder="Inserisci il la tua vecchia password"
                />
            </FormGroup>
            <FormGroup className="mb-3">
                <Form.Label className="text-light">New Password</Form.Label>
                <Form.Control
                    type="password"
                    value={newPassword}
                    onChange={(e) => {
                        setNewPassword(e.target.value);
                    }}
                    placeholder="Inserisci la tua nuova password"
                />
            </FormGroup>
            <Container className="d-flex justify-content-center">
                <Button className="col-6 me-1" variant="outline-success" type="submit">
                    Cambia Password
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
                {successMessage !== null && <Alert variant="sucess">{successMessage}</Alert>}
            </Container>
        </Form>
    );
}
