import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Alert, Button, Container, Form, FormGroup, Spinner } from 'react-bootstrap';
import { AuthContext } from '../contexts';
import { Link, useNavigate } from 'react-router-dom';
import { fetchApi } from 'src/api/fetch';
import { type AuthResponse } from '@model/auth';
import { apiCreate as createEndpoint } from 'src/api/routes';
import SidebarSearchLayout from '../layout/SidebarSearchLayout';
import { LogoLight } from 'app/logos/LogosInfo';
import {
    formFormBS,
    inputFormBS,
    buttonFormBS,
    containerFormBS,
    titleFormBS,
    imageFormBS,
    alertFormBS,
    spinnerFormBS,
    linksFormBS,
    subTitleFormBS,
} from 'src/layout/FormsLayout';
import 'src/scss/App.scss';

export default function Register(): JSX.Element {
    const [authState, setAuthState] = useContext(AuthContext);

    const [formName, setFormName] = useState('');
    const [formPassword, setFormPassword] = useState('');

    const [pendingRequest, setPendingRequest] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        if (authState !== null) {
            navigate('/logout');
        }
    }, [authState]);

    const handleCreateUser = useCallback(
        (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            setErrorMessage(null);
            setFormName('');
            setFormPassword('');

            if (!pendingRequest) {
                setPendingRequest(true);
                if (formName === '' || formPassword === '') {
                    setErrorMessage('You must fill the form to complete the Registration!');
                    setPendingRequest(false);
                    return;
                }
                fetchApi<AuthResponse>(
                    createEndpoint,
                    {
                        method: 'POST',
                        body: JSON.stringify({
                            username: formName,
                            password: formPassword,
                        }),
                    },
                    authState,
                    (auth) => {
                        setAuthState(() => auth);
                    },
                    (error) => {
                        setErrorMessage(() => error.message);
                        setPendingRequest(false);
                    },
                );
            }
        },
        [formName, formPassword],
    );

    return (
        <SidebarSearchLayout>
            <Container className={containerFormBS}>
                <h1 className={titleFormBS}>Welcome to Squealer!</h1>
                <img src={LogoLight} width={70} height={70} className={imageFormBS} alt="Squealer Logo" />

                <Form className={formFormBS} onSubmit={handleCreateUser}>
                    <h5 className={subTitleFormBS}>Fill the form to Register as new user!</h5>
                    <FormGroup className={inputFormBS} controlId="UsernameField">
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
                    <FormGroup className={inputFormBS} controlId="PasswordField">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            value={formPassword}
                            onChange={(e) => {
                                setFormPassword(e.target.value);
                            }}
                            placeholder="Insert your password"
                        />
                    </FormGroup>
                    <Button className={buttonFormBS} variant="outline-success" type="submit">
                        Registrati
                    </Button>

                    <small className="text-center mt-2">
                        <Link to="/login" className={linksFormBS}>
                            Do you already have an accont? <br />
                            Login here!
                        </Link>
                    </small>

                    {errorMessage !== null && (
                        <Alert className={alertFormBS} variant="danger">
                            {errorMessage}
                        </Alert>
                    )}
                    {pendingRequest && (
                        <Spinner className={spinnerFormBS} animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                    )}
                </Form>
            </Container>
        </SidebarSearchLayout>
    );
}
