import { Button, Container, Stack, Spinner, Form, Alert } from 'react-bootstrap';
import { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from 'src/contexts';
import { type ISuccessMessage, type IUser } from '@model/user';
import { apiSmmDeleteRequest, apiSmmMyRequests, apiSmmSendRequest } from 'src/api/routes';
import { fetchApi } from 'src/api/fetch';
import { stringFormat } from 'src/utils';

interface State {
    loading: boolean;
    currentSmm: string | null;
    error: string | null;
    currentRequest: string | null;
}

export default function ChangeUsername({ user }: { user: IUser }): JSX.Element {
    const [auth] = useContext(AuthContext);
    const currentInput = useRef<string>('');
    const [state, setState] = useState<State>({
        loading: true,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        currentSmm: user.smm !== undefined ? user.smm : (null as string | null),
        error: null,
        currentRequest: null,
    });

    useEffect(() => {
        fetchApi<ISuccessMessage>(
            apiSmmMyRequests,
            { method: 'GET' },
            auth,
            (u) => {
                setState((s) => ({ ...s, loading: false, currentRequest: u.message === '' ? null : u.message }));
            },
            (error) => {
                setState((s) => ({ ...s, loading: false, error: error.message }));
            },
        );
    }, []);

    const updateCurrentRequest = (): void => {
        setState((s) => ({ ...s, loading: true, error: null }));
        fetchApi<ISuccessMessage>(
            stringFormat(apiSmmSendRequest, [currentInput.current]),
            {
                method: 'POST',
            },
            auth,
            (m) => {
                setState({
                    error: null,
                    loading: false,
                    currentRequest: m.message,
                    currentSmm: null,
                });
            },
            (error) => {
                setState((s) => ({ ...s, loading: false, error: error.message }));
            },
        );
    };

    const deleteRequest = (): void => {
        setState((s) => ({ ...s, loading: true, error: null }));
        fetchApi<ISuccessMessage>(
            apiSmmDeleteRequest,
            { method: 'DELETE' },
            auth,
            (_) => {
                setState({
                    error: null,
                    loading: false,
                    currentRequest: null,
                    currentSmm: null,
                });
            },
            (error) => {
                setState((s) => ({ ...s, loading: false, error: error.message }));
            },
        );
    };

    return (
        <Container className="d-flex justify-content-center text-center p-3">
            <Stack>
                {state.loading ? (
                    <Spinner animation="border" role="status" />
                ) : (
                    <>
                        {state.currentRequest !== null && <h5>Pending Request To: {state.currentRequest}</h5>}
                        {state.currentSmm !== null && <h5>Current Smm is:{state.currentSmm}</h5>}
                        <Form>
                            <Form.Group className="mb-3" controlId="ChangeSmm">
                                <Form.Label>Change SMM</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter new SMM"
                                    onChange={(e): void => {
                                        e.preventDefault();
                                        currentInput.current = e.target.value;
                                    }}
                                />
                                <Button variant="danger" onClick={deleteRequest}>
                                    Delete currentRequest
                                </Button>
                                <Button variant="primary" onClick={updateCurrentRequest}>
                                    Change currentRequest
                                </Button>
                            </Form.Group>
                        </Form>
                        {state.error !== null && <Alert variant="danger">{state.error}</Alert>}
                    </>
                )}
            </Stack>
        </Container>
    );
}
