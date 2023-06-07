import { Alert, Button, Container, Spinner, Stack, Form } from 'react-bootstrap';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts';
import { apiUserBase } from 'src/api/routes';
import { fetchApi } from 'src/api/fetch';
import { type IUser, UserRoles } from '@model/user';
import { useNavigate } from 'react-router-dom';

export default function DeleteAccount(): JSX.Element {
    const [authState] = useContext(AuthContext);
    const [pendingRequest, setPendingRequest] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [rule, setRule] = useState<string>(UserRoles.NORMAL as string);
    const [defaultRule, setDefaultRule] = useState<string>(UserRoles.NORMAL as string);

    const navigate = useNavigate();
    useEffect(() => {
        if (authState === null) {
            navigate('/login');
            return;
        }
        fetchApi<IUser>(
            `${apiUserBase}/${authState.username}`,
            {
                method: 'GET',
            },
            authState,
            (u) => {
                setDefaultRule(u.role);
                setPendingRequest(false);
            },
            (error) => {
                setErrorMessage(() => error.message);
            },
        );
    }, [authState]);

    function handleUpdateRole(): void {
        setErrorMessage(null);

        if (!pendingRequest) {
            setPendingRequest(true);
            fetchApi<IUser>(
                `${apiUserBase}/role`,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        role: rule,
                    }),
                },
                authState,
                () => {
                    navigate(0);
                },
                (error) => {
                    setErrorMessage(() => error.message);
                    setPendingRequest(false);
                },
            );
        }
    }
    const roles: string[] = [UserRoles.MODERATOR, UserRoles.SMM, UserRoles.NORMAL, UserRoles.VIP];

    return (
        <Container className="d-flex justify-content-center text-center p-3">
            <Stack>
                <h4>Change User Role</h4>
                <p>Current Role: {defaultRule}</p>

                <Form.Select
                    aria-label="Role User"
                    onChange={(e) => {
                        e.preventDefault();
                        setRule(e.currentTarget.value as UserRoles);
                    }}
                >
                    {roles.map((role) => (
                        <option key={role} value={role}>
                            {role}
                        </option>
                    ))}
                </Form.Select>

                <Button onClick={handleUpdateRole} disabled={pendingRequest}>
                    Update
                </Button>
                <Container>
                    {pendingRequest && (
                        <>
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Cancellazione...</span>
                            </Spinner>
                        </>
                    )}
                    {errorMessage !== null && <Alert variant="danger">{errorMessage}</Alert>}
                </Container>
            </Stack>
        </Container>
    );
}
