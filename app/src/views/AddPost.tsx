import SidebarSearchLayout from 'src/layout/SidebarSearchLayout';
import { Form, Button } from 'react-bootstrap';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from 'src/contexts';
import { useNavigate } from 'react-router-dom';
import { MessageCreation, type IMessage } from '@model/message';
import { useParams } from 'react-router';
import { fetchApi } from 'src/api/fetch';
import { apiMessageBase } from 'src/api/routes';

export default function AddPost(): JSX.Element {
    const [authState] = useContext(AuthContext);
    const navigate = useNavigate();
    const { parent } = useParams();

    const [messageText, setMessageText] = useState('');
    const [destination, setDestination] = useState('');

    if (authState === null) {
        navigate('/login');
    }

    const [displayParent, setDisplayParent] = useState<IMessage | null | undefined>(null);

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
                setDisplayParent(() => undefined);
            },
        );
    }, [parent]);

    function sendMessage(event: React.FormEvent<HTMLFormElement>): void {
        event?.preventDefault();
        const message: MessageCreation = {
            content: {
                data: messageText,
                type: 'text/plain',
            },
            destination: destination,
            parent: parent ?? '',
        };
        fetchApi<IMessage>(
            `${apiMessageBase}/`,
            {
                method: 'POST',
                body: JSON.stringify(message),
            },
            authState,
            (message) => {},
            (error) => {},
        );
    }
    let parentMessage = <> </>;

    if (parent != null) {
        if (displayParent == null) {
            parentMessage = <> Loading Message </>;
        } else if (displayParent === undefined) {
            parentMessage = (
                <>
                    {' '}
                    <p>Il messaggio padre non esiste</p>{' '}
                </>
            );
        } else {
            parentMessage = (
                <>
                    {' '}
                    <p>Il messaggio padre è: {displayParent.content.data}</p>{' '}
                </>
            );
        }
    }

    return (
        <SidebarSearchLayout>
            <>
                {parentMessage}
                <Form>
                    <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                        <Form.Label>Email address</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="name@example.com"
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
                    <Button type="submit" onClick={sendMessage}></Button>
                </Form>
            </>
        </SidebarSearchLayout>
    );
}
