import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Button, Container, Form, FormGroup, Spinner } from 'react-bootstrap';
import { AuthContext } from '../contexts';
import { apiAuthUserBase as authUserEndpoint } from 'src/api/routes';
import { useNavigate } from 'react-router-dom';
import { fetchApi } from 'src/api/fetch';
import SidebarSearchLayout from 'src/layout/SidebarSearchLayout';

export default function Reset(): JSX.Element {
    const [authState] = useContext(AuthContext);

    const [formName, setFormName] = useState('');

    const [resetQuestion, setResetQuestion] = useState<string | null>(null);

    const [pendingRequest, setPendingRequest] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    function handleResetPassword(): void {
        setErrorMessage(null);
        if (!pendingRequest) {
            setPendingRequest(true);
            fetchApi<string>(
                `${authUserEndpoint}/reset-question`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        username: formName,
                    }),
                },
                authState,
                (resetquestion) => {
                    setResetQuestion(resetquestion);
                },
                (error) => {
                    setErrorMessage(() => error.message);
                    setPendingRequest(false);
                },
            );
        }
    }

    const onSubmit = useCallback(
        (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            setFormName('');
            handleResetPassword();
        },
        [formName],
    );

    const onClick = useCallback(() => {
        if (authState !== null) {
            setFormName(authState.username);
            handleResetPassword();
        }
    }, [formName]);

    return (
        <SidebarSearchLayout>
            {authState === null ? (
                <Form className="container-fluid m-0 p-3" onSubmit={onSubmit}>
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
                </Form>
            ) : (
                <Button onClick={onClick}>Avvia il Reset della Password</Button>
            )}
            {/* SECONDA PARTE IMPORTNATE */}
        </SidebarSearchLayout>
    );
}
