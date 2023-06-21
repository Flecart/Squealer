import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Alert, Button, Container, Form, FormGroup, Spinner } from 'react-bootstrap';
import { AuthContext } from '../contexts';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { fetchApi } from 'src/api/fetch';
import { type AuthResponse } from '@model/auth';
import { apiLogin as loginEndpoint } from 'src/api/routes';
import SidebarSearchLayout from '../layout/SidebarSearchLayout';
import 'src/scss/App.scss';
import { LogoLight } from 'app/logos/LogosInfo';
import {
    formFormBS,
    inputFormBS,
    buttonFormBS,
    containerFormBS,
    titleFormBS,
    imageFormBS,
    spinnerFormBS,
    alertFormBS,
    subTitleFormBS,
    linksFormBS,
} from 'src/layout/FormsLayout';

export default function Login(): JSX.Element {
    const [authState, setAuthState] = useContext(AuthContext);

    const [searchParams] = useSearchParams();

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

    const handleLoginUser = useCallback(
        (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            setErrorMessage(null);
            setFormName('');
            setFormPassword('');

            if (!pendingRequest) {
                setPendingRequest(true);
                fetchApi<AuthResponse>(
                    loginEndpoint,
                    {
                        method: 'POST',
                        body: JSON.stringify({
                            username: formName,
                            password: formPassword,
                        }),
                    },
                    authState,
                    (auth) => {
                        setAuthState(auth);
                        const redirect = searchParams.get('redirect');
                        if (redirect !== null) {
                            window.location.href = redirect;
                        } else {
                            navigate('/');
                        }
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
                <h1 className={titleFormBS}>Welcome back to Squealer!</h1>
                <img src={LogoLight} width={70} height={70} className={imageFormBS} alt="Logo Squealer" />
                <Form className={formFormBS} onSubmit={handleLoginUser}>
                    <h5 className={subTitleFormBS}>Insert your credentials to Login in your account!</h5>
                    <FormGroup className={inputFormBS} controlId="FormUsername">
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
                    <FormGroup className={inputFormBS} controlId="FormPassword">
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
                        Login
                    </Button>

                    <small className="text-center mt-2">
                        <Link to="/recover" className={linksFormBS}>
                            Did you lost your credentials? <br />
                            Reset your password here!
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
