import { Alert, Button, Form, FormGroup, Spinner } from 'react-bootstrap';
import React, { useCallback, useContext, useState } from 'react';
import { AuthContext } from '../../contexts';
import { fetchApi } from '../../api/fetch';
import { apiChangePassword } from 'src/api/routes';
import { stringFormat } from 'src/utils';

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
                    stringFormat(apiChangePassword, [authState?.username]),
                    {
                        method: 'POST',
                        body: JSON.stringify({
                            old_password: oldPassword,
                            new_password: newPassword,
                        }),
                    },
                    authState,
                    () => {
                        setSuccessMessage('Password has been changed succesfully');
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
        <Form className="form-form-bs" onSubmit={handleChangePassword}>
            <FormGroup className="input-form-bs" controlId="OldPassword">
                <Form.Label>Old Password</Form.Label>
                <Form.Control
                    type="text"
                    value={oldPassword}
                    onChange={(e) => {
                        setOldPassword(e.target.value);
                    }}
                    placeholder="Insert your old password"
                />
            </FormGroup>
            <FormGroup className="input-form-bs" controlId="NewPassword">
                <Form.Label>New Password</Form.Label>
                <Form.Control
                    type="password"
                    value={newPassword}
                    onChange={(e) => {
                        setNewPassword(e.target.value);
                    }}
                    placeholder="Insert your new password"
                />
            </FormGroup>
            <Button className="button-setting-bs" variant="outline-success" type="submit">
                Change Password
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
                </Alert>
            )}
        </Form>
    );
}
