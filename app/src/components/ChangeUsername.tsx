import { Alert, Button, Form, FormGroup, Spinner } from 'react-bootstrap';
import React, { useCallback, useContext, useState } from 'react';
import { AuthContext } from '../contexts';
import { fetchApi } from '../api/fetch';
import { apiAuthUserBase } from 'src/api/routes';
import { useNavigate } from 'react-router-dom';

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
        <Form className="form-form-bs" onSubmit={handleChangeUsername}>
            <FormGroup className="input-form-bs" controlId="NewUsername">
                <Form.Label>New Username</Form.Label>
                <Form.Control
                    type="text"
                    value={newUsername}
                    onChange={(e) => {
                        setNewUsername(e.target.value);
                    }}
                    placeholder="Insert your new username"
                />
            </FormGroup>
            <Button className="button-setting-bs" variant="outline-success" type="submit">
                Change Username
            </Button>
            {errorMessage !== null && (
                <Alert className="alert-form-bs" variant="danger">
                    {errorMessage}
                </Alert>
            )}
            {pendingRequest && (
                <Spinner className="spinner-form-bs" animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            )}
        </Form>
    );
}
