import { Container, Row } from 'react-bootstrap';
import Image from 'react-bootstrap/Image';
import { type IUser } from '@model/user';
import { type HttpError } from '@model/error';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchApi } from '../api/fetch';
import { apiMessageBase, apiUser } from 'src/api/routes';
import SidebarSearchLayout from 'src/layout/SidebarSearchLayout';
import MessageSortComponent from 'src/components/MessageSortComponent';
import { stringFormat } from 'src/utils';

function User(): JSX.Element {
    const { username } = useParams();
    const navigator = useNavigate();

    const [user, setUser] = useState<IUser | null>(null);

    const handleUserError = useCallback((error: HttpError): void => {
        if (error.status === 404) navigator('/404');
    }, []);

    useEffect(() => {
        if (username === undefined) return;
        fetchApi<IUser>(
            stringFormat(apiUser, [username]),
            { method: 'GET' },
            null,
            (user) => {
                setUser(() => user);
            },
            handleUserError,
        );
    }, [username]);

    return (
        <SidebarSearchLayout>
            <Container className="d-flex justify-content-center flex-column pb-4">
                <Row className="py-3 m-auto" style={{ maxWidth: '10rem', minWidth: '10rem' }}>
                    {user !== null && <Image src={user?.profile_pic} alt="profile image" roundedCircle />}
                </Row>
                {/* TODO: mettere schermata di loading, tipo scheletons */}
                <Row>
                    <h1 className="text-center">{user?.name ?? ' '}</h1>
                </Row>
                <Row>
                    <h2 className="text-center">@{username}</h2>
                </Row>
                {/* TODO: edit profile button if the user is him self */}
            </Container>

            <Container as="main">
                {user !== null && (
                    <>
                        {user.messages.length === 0 ? (
                            <h2>No Messages</h2>
                        ) : (
                            <MessageSortComponent
                                reqInit={{ method: 'GET' }}
                                url={`${apiMessageBase}/user/${user.username}/messageIds`}
                            />
                        )}
                    </>
                )}
            </Container>
        </SidebarSearchLayout>
    );
}

export default User;
