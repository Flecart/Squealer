import { Alert, Button, Form, FormGroup, Spinner } from 'react-bootstrap';
import React, { useCallback, useContext, useState } from 'react';
import { AuthContext } from 'src/contexts';
import { fetchApi } from 'src/api/fetch';
import { apiChangeUsername } from 'src/api/routes';
import { useNavigate } from 'react-router-dom';
import { stringFormat } from 'src/utils';

export default function ChangeUsername(): JSX.Element {
    const navigate = useNavigate();

    const [authState] = useContext(AuthContext);

    const [newName, setNewName] = useState('');

    const [pendingRequest, setPendingRequest] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleChangeUsername = useCallback(
        (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            setErrorMessage(null);
            setNewName('');

            if (!pendingRequest) {
                if (authState == null) return;
                setPendingRequest(true);
                fetchApi<null>(
                    stringFormat(apiChangeUsername, [authState?.username]),
                    {
                        method: 'POST',
                        body: JSON.stringify({
                            new_name: newName,
                        }),
                    },
                    authState,
                    () => {
                        navigate(0);
                    },
                    (error) => {
                        setErrorMessage(() => error.message);
                        setPendingRequest(false);
                    },
                );
            }
        },
        [newName],
    );

    return (
        <Form className="form-form-bs" onSubmit={handleChangeUsername}>
            <FormGroup className="input-form-bs" controlId="NewUsername">
                <Form.Label>New Name</Form.Label>
                <Form.Control
                    type="text"
                    value={newName}
                    onChange={(e) => {
                        setNewName(e.target.value);
                    }}
                    placeholder="Insert your new display name"
                />
            </FormGroup>
            <Button className="button-setting-bs" variant="outline-success" type="submit">
                Change Name
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
