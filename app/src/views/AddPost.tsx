import SidebarSearchLayout from 'src/layout/SidebarSearchLayout';
import { Form, Button, Alert, Row } from 'react-bootstrap';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from 'src/contexts';
import { useNavigate } from 'react-router-dom';
import { type MessageCreation, type IMessage, type MessageCreationRensponse } from '@model/message';
import { useParams } from 'react-router';
import { fetchApi } from 'src/api/fetch';
import { apiMessageBase } from 'src/api/routes';
import Post from 'src/components/Post';

export default function AddPost(): JSX.Element {
    const [authState] = useContext(AuthContext);
    const navigate = useNavigate();
    const { parent } = useParams();

    const [messageText, setMessageText] = useState<string>('');
    const [destination, setDestination] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    if (authState === null) {
        navigate('/login');
    }

    const [displayParent, setDisplayParent] = useState<IMessage | null | string>(null);

    useEffect(() => {
        if (parent == null) return;
        fetchApi<IMessage>(
            `${apiMessageBase}/${parent}/`,
            {
                method: 'GET',
            },
            authState,
            (messaggio) => {
                setDisplayParent(() => messaggio);
            },
            (error) => {
                // TODO: gestire il caso in cui il parent non ci sia
                setDisplayParent(() => error.message);
            },
        );
    }, [parent]);

    function sendMessage(event: React.FormEvent<HTMLButtonElement>): void {
        event?.preventDefault();
        const message: MessageCreation = {
            content: {
                data: messageText,
                type: 'text/plain',
            },
            channel: destination,
            parent,
        };
        fetchApi<MessageCreationRensponse>(
            `${apiMessageBase}/`,
            {
                method: 'POST',
                body: JSON.stringify(message),
            },
            authState,
            (message) => {
                navigate(`/message/${message.id}`);
            },
            (error) => {
                setError(() => error.message);
            },
        );
    }
    let parentMessage = <> </>;

    if (parent != null) {
        if (displayParent == null) {
            parentMessage = <> Loading Message </>;
        } else if (displayParent instanceof String) {
            parentMessage = <Alert variant="danger">{displayParent}</Alert>;
        } else if (displayParent instanceof Object) {
            parentMessage = <Post message={displayParent}></Post>;
        }
    }

    return (
        <SidebarSearchLayout>
            <>
                {parentMessage}
                <Form>
                    <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                        <Form.Label>Channel</Form.Label>
                        <Form.Control
                            onChange={(e) => {
                                setDestination(e.target.value);
                            }}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                        <Form.Label>Example textarea</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            onChange={(e) => {
                                setMessageText(e.target.value);
                            }}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Default file input example</Form.Label>
                        <Form.Control type="file" />
                    </Form.Group>
                    <Button type="submit" onClick={sendMessage}>
                        Send
                    </Button>
                    {error !== null && (
                        <Row>
                            <Alert variant="danger">{error}</Alert>
                        </Row>
                    )}
                </Form>
            </>
        </SidebarSearchLayout>
    );
}
