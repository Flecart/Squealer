/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { type IMessage, type Invitation } from '@model/message';
import { Button, Card, Container, Stack } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../contexts';
import { fetchApi } from '../api/fetch';
import { apiChannelBase } from 'src/api/routes';
import { type ChannelResponse } from '@model/channel';

interface PostProps {
    message: IMessage;
}

function InviteMessage({ message }: PostProps): JSX.Element {
    if (message.content.type !== 'invitation') {
        console.log('should not be displayed');
        return <></>;
    }
    const [hide, setHide] = useState(false);
    const [auth] = useContext(AuthContext);
    const userUrl = `user/${message.creator}`;
    const invitation: Invitation = message.content.data as Invitation;
    const channelUrl = `channel/${invitation.channel}`;
    const accept = (): void => {
        fetchApi<ChannelResponse>(
            `${apiChannelBase}/accept`,
            {
                method: 'POST',
                body: JSON.stringify({
                    messageID: message._id.toString(),
                }),
            },
            auth,
            () => {
                setHide(true);
                // maybe we can navigate to that channel
            },
            (_) => { },
        );
    };
    const decline = (): void => {
        fetchApi<ChannelResponse>(
            `${apiChannelBase}/decline`,
            {
                method: 'POST',
                body: JSON.stringify({
                    messageID: message._id.toString(),
                }),
            },
            auth,
            () => {
                setHide(true);
                // maybe we can navigate to that channel
            },
            (_) => { },
        );
    };

    return (
        <>
            {!hide && (
                <Card body>
                    <Stack className="" as="article" role="article" gap={3}>
                        <Container className="d-flex justify-content-center ">
                            <span>
                                {"L'utente "} <Link to={userUrl}>{message.creator}</Link> ti ha invitato in ad unirti al
                                canale
                                <Link to={channelUrl}> {invitation.channel} </Link>
                            </span>
                        </Container>
                        <Stack direction="horizontal" gap={4} className="justify-content-center">
                            <Button onClick={accept}>Accetto</Button> <Button onClick={decline}>Declino</Button>{' '}
                        </Stack>
                    </Stack>
                </Card>
            )}
        </>
    );
}

export default InviteMessage;
