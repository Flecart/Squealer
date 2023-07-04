import { Alert, Button, Container, Spinner, Stack, Form } from 'react-bootstrap';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from 'src/contexts';
import { apiUser, apiUserRole } from 'src/api/routes';
import { fetchApi } from 'src/api/fetch';
import { type IUser, UserRoles } from '@model/user';
import { useNavigate } from 'react-router-dom';
import { stringFormat } from 'src/utils';

export default function DeleteAccount(): JSX.Element {
    const [authState] = useContext(AuthContext);
    const [pendingRequest, setPendingRequest] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [role, setRole] = useState<string>(UserRoles.NORMAL as string);
    const [defaultRule, setDefaultRule] = useState<string>(UserRoles.NORMAL as string);

    const navigate = useNavigate();
    useEffect(() => {
        if (authState === null) {
            navigate('/login');
            return;
        }
        fetchApi<IUser>(
            stringFormat(apiUser, [authState.username]),
            {
                method: 'GET',
            },
            authState,
            (u) => {
                setDefaultRule(u.role);
                setRole(u.role);
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
                apiUserRole,
                {
                    method: 'POST',
                    body: JSON.stringify({
                        role,
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
    const roles: string[] = [UserRoles.MODERATOR, UserRoles.SMM, UserRoles.NORMAL, UserRoles.VIP, UserRoles.VERIFIED];

    return (
        <Container className="d-flex justify-content-center text-center p-3">
            <Stack>
                <h4>Change User Role</h4>
                <p>Current Role: {defaultRule}</p>

                <Form.Select
                    aria-label="Role User"
                    value={role}
                    onChange={(e) => {
                        e.preventDefault();
                        setRole(e.currentTarget.value as UserRoles);
                    }}
                >
                    {roles.map((cRole) => (
                        <option key={cRole} value={cRole}>
                            {cRole}
                        </option>
                    ))}
                </Form.Select>

                <Button
                    onClick={handleUpdateRole}
                    disabled={pendingRequest}
                    className="button-setting-bs"
                    variant="outline-success"
                >
                    Update
                </Button>
                <Container>
                    {pendingRequest && (
                        <>
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Cancelling...</span>
                            </Spinner>
                        </>
                    )}
                    {errorMessage !== null && <Alert variant="danger">{errorMessage}</Alert>}
                </Container>
            </Stack>
        </Container>
    );
}
