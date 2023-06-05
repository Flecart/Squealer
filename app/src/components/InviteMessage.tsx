/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { type IMessage, type Invitation } from '@model/message';
import { Button, Container, Row, Stack } from 'react-bootstrap';
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
        <Row className="g-4" as="article" role="article">
            <Container className="d-flex justify-content-center flex-column pb-4">
                <Row>
                    {"L'utente "} <Link to={userUrl}>message.creator</Link> ti ha invitato in ad unirti al canale
                    <Link to={channelUrl}> {invitation.channel} </Link>
                </Row>
                <Stack direction="horizontal" gap={3} className="justify-content-center">
                    <Button></Button> <Button></Button>{' '}
                </Stack>
            </Container>
        </Row>
    );
}

export default InviteMessage;
