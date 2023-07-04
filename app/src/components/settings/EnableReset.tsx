import { Alert, Button, Form, FormGroup, Spinner } from 'react-bootstrap';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { AuthContext } from 'src/contexts';
import { fetchApi } from 'src/api/fetch';
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
            settingResetEndpoint,
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
                    settingResetEndpoint,
                    {
                        method: 'POST',
                        body: JSON.stringify({
                            Password: password,
                        }),
                    },
                    authState,
                    (_otp) => {
                        setSuccessMessage('Password Reset enabled sucessfully');
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
                <Form className="form-form-bs" onSubmit={handleChangePassword}>
                    <FormGroup className="input-form-bs" controlId="Password">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                            }}
                            placeholder="Insert your password"
                        />
                    </FormGroup>
                    <Button className="button-setting-bs" variant="outline-success" type="submit">
                        Enable Password Reset
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
                    {successMessage !== null && (
                        <Alert className="alert-form-bs" variant="sucess">
                            {successMessage}
                            <br />
                            Take great care of your recovery password:
                            <br />
                            {otp}
                        </Alert>
                    )}
                </Form>
            ) : (
                <Alert className="alert-form-bs" variant="success">
                    Reset Password service is already enabled!
                </Alert>
            )}
        </>
    );
}
