/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Button, Card, Container, Stack } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../contexts';
import { fetchApi } from '../api/fetch';
import { apiChannelAccept, apiChannelDecline } from 'src/api/routes';
import { type ChannelResponse } from '@model/channel';
import { type ISuccessMessage } from '@model/user';
import { type IInvitationRensponse } from '@model/invitation';

interface PostProps {
    invitation: IInvitationRensponse;
}

function InviteMessage({ invitation }: PostProps): JSX.Element {
    const [hide, setHide] = useState(false);
    const [auth] = useContext(AuthContext);
    const userUrl = `/user/${invitation.to}`;
    const channelUrl = `/channel/${invitation.channel}`;
    const navigate = useNavigate();

    const accept = (): void => {
        fetchApi<ChannelResponse>(
            apiChannelAccept,
            {
                method: 'POST',
                body: JSON.stringify({
                    messageID: invitation._id,
                }),
            },
            auth,
            () => {
                setHide(true);
                navigate(channelUrl);
            },
            (_) => {},
        );
    };
    const decline = (): void => {
        fetchApi<ISuccessMessage>(
            apiChannelDecline,
            {
                method: 'POST',
                body: JSON.stringify({
                    messageID: invitation._id,
                }),
            },
            auth,
            () => {
                setHide(true);
                // maybe we can navigate to that channel
            },
            (_) => {},
        );
    };

    return (
        <>
            {!hide && (
                <Card body>
                    <Stack className="" as="article" role="article" gap={3}>
                        <Container className="d-flex justify-content-center ">
                            <span>
                                User <Link to={userUrl}>{invitation.issuer}</Link>
                                invited you to join th channel
                                <Link to={channelUrl}> {invitation.channel} </Link>
                            </span>
                        </Container>
                        <Stack direction="horizontal" gap={4} className="justify-content-center">
                            <Button variant="success" onClick={accept}>
                                Accept
                            </Button>{' '}
                            <Button variant="danger" onClick={decline}>
                                Decline
                            </Button>{' '}
                        </Stack>
                    </Stack>
                </Card>
            )}
        </>
    );
}

export default InviteMessage;
