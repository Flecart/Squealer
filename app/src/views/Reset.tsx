import React, { useCallback, useState } from 'react';
import { Alert, Button, Container, Form, FormGroup, Spinner } from 'react-bootstrap';
import { apiResetPassword as resetPasswordEndpoint } from 'src/api/routes';
import { fetchApi } from 'src/api/fetch';
import SidebarSearchLayout from 'src/layout/SidebarSearchLayout';
import {
    alertFormBS,
    buttonFormBS,
    containerFormBS,
    formFormBS,
    inputFormBS,
    subTitleFormBS,
} from 'src/layout/FormsLayout';
import 'src/scss/App.scss';

export default function Reset(): JSX.Element {
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
                    null,
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
            <Container className={containerFormBS}>
                {resetPassword === null ? (
                    <Form className={formFormBS} onSubmit={showResetPassword}>
                        <h5 className={subTitleFormBS}>
                            Use your username and recovery password to Reset your password so you can access to your
                            account.
                        </h5>
                        <FormGroup className={inputFormBS} controlId="UsernameForm">
                            <Form.Label>Username</Form.Label>
                            <Form.Control
                                type="text"
                                value={formName}
                                onChange={(e) => {
                                    setFormName(e.target.value);
                                }}
                                placeholder="Insert your username"
                            />
                        </FormGroup>
                        <FormGroup className={inputFormBS} controlId="RecoveryPasswordForm">
                            <Form.Label>Recovery Password</Form.Label>
                            <Form.Control
                                type="text"
                                value={otp}
                                onChange={(e) => {
                                    setOtp(e.target.value);
                                }}
                                placeholder="Insert your recovery password"
                            />
                        </FormGroup>
                        <Button className={buttonFormBS} variant="outline-success" type="submit">
                            Conferma
                        </Button>
                        {errorMessage !== null && (
                            <Alert className={alertFormBS} variant="danger">
                                {errorMessage}
                            </Alert>
                        )}
                        {pendingRequest && (
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                        )}
                    </Form>
                ) : (
                    <Alert className={alertFormBS} variant="success">
                        Your password has been resetted with success. <br />
                        Your new password is:
                        <b>{resetPassword}</b>
                    </Alert>
                )}
            </Container>
        </SidebarSearchLayout>
    );
}
