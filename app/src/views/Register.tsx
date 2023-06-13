import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Button, Collapse, Container, Form, FormGroup, Spinner } from 'react-bootstrap';
import { AuthContext } from '../contexts';
import { useNavigate } from 'react-router-dom';
import { fetchApi } from 'src/api/fetch';
import { type AuthResponse } from '@model/auth';
import { apiCreate as createEndpoint, apiSettingReset } from 'src/api/routes';
import SidebarSearchLayout from '../layout/SidebarSearchLayout';
import { LogoLight } from 'app/logos/LogosInfo';

export default function Register(): JSX.Element {
    const [authState, setAuthState] = useContext(AuthContext);

    const [formName, setFormName] = useState('');
    const [formPassword, setFormPassword] = useState('');

    const [enableReset, setEnableReset] = useState<boolean>(false);
    const [questionForm, setQuestionForm] = useState('');
    const [answerForm, setAnswerForm] = useState('');

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
                        if (!enableReset) navigate('/');
                    },
                    (error) => {
                        setErrorMessage(() => error.message);
                        setPendingRequest(false);
                    },
                );

                if (enableReset && errorMessage !== null) {
                    fetchApi<AuthResponse>(
                        apiSettingReset,
                        {
                            method: 'POST',
                            body: JSON.stringify({
                                resetQuestion: questionForm,
                                resetPassword: answerForm,
                            }),
                        },
                        authState,
                        (_) => {
                            navigate('/');
                        },
                        (error) => {
                            setErrorMessage(() => error.message);
                            setPendingRequest(false);
                        },
                    );
                }
            }
        },
        [formName, formPassword],
    );

    return (
        <SidebarSearchLayout>
            <Container className="d-flex flex-column align-items-center">
                <h1 className="m-0 text-center">Benvenuto su Squealer!</h1>
                <img src={LogoLight} width={100} height={100} className="d-inline-block" alt="Logo Squealer" />

                <Form className="container-fluid m-0 p-3 border rounded-3" onSubmit={handleCreateUser}>
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
                        <Form.Label className="text-light">Password</Form.Label>
                        <Form.Control
                            type="password"
                            value={formPassword}
                            onChange={(e) => {
                                setFormPassword(e.target.value);
                            }}
                            placeholder="Inserisci la tua password"
                        />
                    </FormGroup>
                    <FormGroup className="mb-1">
                        <Form.Check
                            type="checkbox"
                            checked={enableReset}
                            onChange={() => {
                                setEnableReset(!enableReset);
                            }}
                            label={'Impostare il Reset Password'}
                        />
                    </FormGroup>

                    <Form.Text className="mb-3">
                        Nota: Puoi attivare questa funzione anche in futuro, basta andare nelle impostazioni.
                    </Form.Text>

                    <Collapse in={enableReset}>
                        <span>
                            <FormGroup className="my-3">
                                <Form.Label className="text-light">Domanda di Recupero</Form.Label>
                                <Form.Control
                                    disabled={!enableReset}
                                    type="text"
                                    value={questionForm}
                                    onChange={(e) => {
                                        setQuestionForm(e.target.value);
                                    }}
                                    placeholder="Inserisci la tua domanda di recupero"
                                />
                            </FormGroup>
                            <FormGroup className="mb-1">
                                <Form.Label className="text-light">Risposta di Recupero</Form.Label>
                                <Form.Control
                                    disabled={!enableReset}
                                    type="password"
                                    value={answerForm}
                                    onChange={(e) => {
                                        setAnswerForm(e.target.value);
                                    }}
                                    placeholder="Inserisci la risposta alla tua domanda"
                                />
                            </FormGroup>

                            <Form.Text>
                                Il reset della password è una funzione che ti permette di recuperare il tuo account in
                                caso di dimenticanza delle credenziali.
                                <br />
                                Puoi scegliere una domanda e la sua risposta a tua discrezione di cui solo tu sei a
                                conoscenza.
                                <br />
                                <b>Non inserire dati sensibili!</b>
                            </Form.Text>
                        </span>
                    </Collapse>

                    <Container className="d-flex justify-content-center mt-1">
                        <Button className="col-6 me-1" variant="outline-success" type="submit">
                            Registrati
                        </Button>
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
                    </Container>
                </Form>
            </Container>
        </SidebarSearchLayout>
    );
}
