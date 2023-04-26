import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as userSelectors from '@flux/selectors/user';
import * as userActions from '@flux/actions/user';

import { Button, Container, Form, FormGroup } from 'react-bootstrap';

export default function Login(): JSX.Element {
    const dispatch = useDispatch();
    const [formName, setFormName] = useState('');
    const [formPassword, setFormPassword] = useState('');

    const handleCreateUser = useCallback(
        (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            dispatch(userActions.loginUser({ username: formName, password: formPassword }));
        },
        [dispatch, formName, formPassword],
    );

    const name = useSelector(userSelectors.getUserName);
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
            <p> Name is: -{name}- </p>
        </Container>
    );
}
