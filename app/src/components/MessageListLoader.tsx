import { type IMessage } from '@model/message';
import { useContext, useEffect, useState } from 'react';
import { Alert, Spinner, Stack } from 'react-bootstrap';
import { fetchApi } from 'src/api/fetch';
import { apiMessageBase } from 'src/api/routes';
import { AuthContext } from 'src/contexts';
import InviteMessage from './InviteMessage';
import Post from './Post';

interface PropsMessageIds {
    childrens: string[];
}

export default function MessageListLoader({ childrens }: PropsMessageIds): JSX.Element {
    if (childrens.length === 0) return <></>;

    const [authState] = useContext(AuthContext);
    const [messages, setMessages] = useState<IMessage[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        const params = new URLSearchParams(childrens.map((s) => ['ids', s])).toString();
        fetchApi<IMessage[]>(
            `${apiMessageBase}?${params}`,
            {
                method: 'GET',
            },
            authState,
            (messages) => {
                setMessages(messages);
            },
            (error) => {
                setError(error.message);
            },
        );
    }, [childrens]);

    function Posts(): JSX.Element {
        if (messages === null && error === null) {
            return <Spinner animation="border" role="status" />;
        } else if (messages === null) {
            return <Alert variant="danger">{error}</Alert>;
        } else {
            return (
                <Stack>
                    {messages.map((message) => {
                        if (message.content.type === 'invitation') {
                            return <InviteMessage key={message._id.toString()} message={message} />;
                        }
                        return <Post key={message._id.toString()} message={message} />;
                    })}
                </Stack>
            );
        }
    }

    return <Posts />;
}
