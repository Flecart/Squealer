import React, { useCallback, useContext, useState } from 'react';
import { Button, Container, Form, FormGroup } from 'react-bootstrap';
import { AuthContext } from '../context/authContext'
import useFetch from 'react-fetch-hook'
import { useNavigate } from "react-router-dom";
// import { type AuthParams } from '../context/authContext';





export default function Login(): JSX.Element {
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    const [authState, setAuthState] = useContext(AuthContext);

    const [formName, setFormName] = useState('');
    const [formPassword, setFormPassword] = useState('');

    const [pendingRequest, setPendingRequest] = useState(false);

    const navigate = useNavigate();

    if (authState !== null) {
        navigate('/logout');
    }

    const handleCreateUser = useCallback(
        (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            if (!pendingRequest ) {
                setPendingRequest(() => true);
            }
        },
        [formName, formPassword],
    );

    const { isLoading, data, error } = useFetch('api/login', {
        method: "post",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: formName,
            password: formPassword
        }),
        depends: [pendingRequest]
    });
    if (data!=null) {
        console.log(data);
        // setAuthState(() => data);
    }

    if (error!=null) {
        setPendingRequest(() => false);
        console.log(error);
    }

    if (isLoading) {
        console.log(isLoading);
    }

    return (
        <Container className="d-flex justify-content-center">
            <Form className="m-0 me-4 py-3 px-3 border" onSubmit={handleCreateUser}>
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
                <Container className="d-flex justify-content-center">
                    <Button className="col-6 me-1" variant="outline-success" type="submit">
                        Login
                    </Button>
                </Container>
            </Form>
        </Container>
    );
}
