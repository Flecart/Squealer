import React, { useCallback, useContext, useState } from 'react';
import { Alert, Button, Form, FormGroup, Spinner } from 'react-bootstrap';
import { AuthContext } from '../contexts';
import { apiResetPassword as resetPasswordEndpoint } from 'src/api/routes';
import { fetchApi } from 'src/api/fetch';
import SidebarSearchLayout from 'src/layout/SidebarSearchLayout';

export default function Reset(): JSX.Element {
    const [authState] = useContext(AuthContext);

    const [formName, setFormName] = useState('');

    const [otp, setOtp] = useState('');

    const [resetPassword, setResetPassword] = useState<string | null>(null);

    const [pendingRequest, setPendingRequest] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const showResetPassword = useCallback(
        (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            setFormName('');
            setOtp('');
            setErrorMessage(null);
            if (!pendingRequest) {
                setPendingRequest(true);
                fetchApi<{ otp: string }>(
                    `${resetPasswordEndpoint}`,
                    {
                        method: 'POST',
                        body: JSON.stringify({
                            reset_password: otp,
                            username: formName,
                        }),
                    },
                    authState,
                    (resetpassword) => {
                        setResetPassword(resetpassword.otp);
                        setPendingRequest(false);
                    },
                    (error) => {
                        setErrorMessage(() => error.message);
                        setPendingRequest(false);
                    },
                );
            }
        },
        [otp],
    );

    return (
        <SidebarSearchLayout>
            <div>
                {resetPassword === null ? (
                    <Form className="container-fluid m-0 p-3" onSubmit={showResetPassword}>
                        <FormGroup className="mb-3">
                            <Form.Label className="text-light">Username</Form.Label>
                            <Form.Control
                                type="text"
                                value={formName}
                                onChange={(e) => {
                                    setFormName(e.target.value);
                                }}
                                placeholder="Inserisci il tuo username"
                            />
                        </FormGroup>
                        <FormGroup className="mb-3">
                            <Form.Label className="text-light">Password di Recupero</Form.Label>
                            <Form.Control
                                type="text"
                                value={otp}
                                onChange={(e) => {
                                    setOtp(e.target.value);
                                }}
                                placeholder="Inserisci la tua Password di Recupero"
                            />
                        </FormGroup>
                        <Button className="" variant="outline-success" type="submit">
                            Conferma
                        </Button>
                    </Form>
                ) : (
                    <Alert variant="success">
                        La tua password è stata resettata con successo. <br />
                        La tua nuova password è:
                        <b>{resetPassword}</b>
                    </Alert>
                )}
                {errorMessage !== null && (
                    <>
                        <br />
                        <p className="text-danger">{errorMessage}</p>
                    </>
                )}
                {pendingRequest && (
                    <>
                        <br />
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                    </>
                )}
            </div>
        </SidebarSearchLayout>
    );
}
