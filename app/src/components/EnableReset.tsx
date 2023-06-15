import { Alert, Button, Container, Form, FormGroup, Spinner } from 'react-bootstrap';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts';
import { fetchApi } from '../api/fetch';
import { apiSettingReset as settingResetEndpoint } from 'src/api/routes';

export default function EnebleReset(): JSX.Element {
    const [authState] = useContext(AuthContext);

    const [password, setPassword] = useState('');

    const [otp, setOtp] = useState<string | null>(null);

    const [showEnableReset, setShowEnableReset] = useState(true);

    const [pendingRequest, setPendingRequest] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        fetchApi<{ enableReset: boolean }>(
            `${settingResetEndpoint}`,
            {
                method: 'GET',
            },
            authState,
            (_E) => {
                setShowEnableReset(!_E.enableReset);
            },
            (error) => {
                setErrorMessage(() => error.message);
                setPendingRequest(false);
            },
        );
    }, [showEnableReset]);

    const handleChangePassword = useCallback(
        (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            setErrorMessage(null);
            setPassword('');

            if (!pendingRequest) {
                if (authState == null) return;
                setPendingRequest(true);
                fetchApi<{ otp: string }>(
                    `${settingResetEndpoint}`,
                    {
                        method: 'POST',
                        body: JSON.stringify({
                            Password: password,
                        }),
                    },
                    authState,
                    (_otp) => {
                        setSuccessMessage('Recupero Password abilitato con Successo');
                        setOtp(_otp.otp);
                        setPendingRequest(false);
                    },
                    (error) => {
                        setErrorMessage(() => error.message);
                        setPendingRequest(false);
                    },
                );
            }
        },
        [password],
    );

    return (
        <>
            {showEnableReset ? (
                <Form className="m-0 me-4 py-3 px-3 " onSubmit={handleChangePassword}>
                    <FormGroup className="mb-3">
                        <Form.Label className="text-light">Password</Form.Label>
                        <Form.Control
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                            }}
                            placeholder="Inserisci il la tua password"
                        />
                    </FormGroup>
                    <Container className="d-flex justify-content-center">
                        <Button className="col-6 me-1" variant="outline-success" type="submit">
                            Abilita il Reset della Password
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
                        {successMessage !== null && (
                            <Alert variant="sucess">
                                {successMessage}
                                <br />
                                Custodisci con cura la tua password di riserva:
                                <br />
                                {otp}
                            </Alert>
                        )}
                    </Container>
                </Form>
            ) : (
                <Alert variant="success">Il Servizio di Recupero Password è già abilitato!</Alert>
            )}
        </>
    );
}
