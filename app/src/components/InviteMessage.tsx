/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { type IMessage, type Invitation } from '@model/message';
import { Button, Card, Container, Stack } from 'react-bootstrap';
import { Link } from 'react-router-dom';

interface PostProps {
    message: IMessage;
}

function InviteMessage({ message }: PostProps): JSX.Element {
    if (message.content.type !== 'invitation') {
        console.log('should not be displayed');
        return <></>;
    }
    const userUrl = 'user/' + message.creator;
    const invitation = message.content.data as Invitation;
    const channelUrl = 'channel/' + invitation.channel;

    return (
        <Card body>
            <Stack className="" as="article" role="article" gap={3}>
                <Container className="d-flex justify-content-center ">
                    <span>
                        {"L'utente "} <Link to={userUrl}>{message.creator}</Link> ti ha invitato in ad unirti al canale
                        <Link to={channelUrl}> {invitation.channel} </Link>
                    </span>
                </Container>
                <Stack direction="horizontal" gap={4} className="justify-content-center">
                    <Button>Accetto</Button> <Button>Declino</Button>{' '}
                </Stack>
            </Stack>
        </Card>
    );
}

export default InviteMessage;
