import { type IMessage } from '@model/message';
import { useContext, useEffect, useState } from 'react';
import { Alert, Spinner, Stack } from 'react-bootstrap';
import { fetchApi } from 'src/api/fetch';
import { apiMessageBase } from 'src/api/routes';
import { AuthContext } from 'src/contexts';
import InviteMessage from './InviteMessage';
import Post from './posts/Post';

interface PropsMessageIds {
    invitations: string[];
    compare?: (a: IMessage, b: IMessage) => number;
}

export default function MessageListLoader({ invitations }: PropsMessageIds): JSX.Element {
    if (invitations.length === 0) return <></>;

    const [authState] = useContext(AuthContext);
    const [messages, setMessages] = useState<IInvitation[] | null>(null);
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
                if (compare !== null) messages.sort(compare);
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
                        return <Post key={message._id.toString()} message={message} />;
                    })}
                </Stack>
            );
        }
    }

    return <Posts />;
}
