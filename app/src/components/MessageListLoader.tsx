import { type IMessage } from '@model/message';
import { useCallback, useContext, useEffect, useState } from 'react';
import { Alert, Spinner, Stack } from 'react-bootstrap';
import { fetchApi } from 'src/api/fetch';
import { apiMessageBase } from 'src/api/routes';
import { AuthContext } from 'src/contexts';
import Post from './posts/Post';

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
    }, []);

    const Posts = useCallback(() => {
        if (messages === null && error === null) {
            return (
                <div className="d-flex justify-content-center">
                    <Spinner animation="border" role="status" />
                </div>
            );
        } else if (messages === null) {
            return <Alert variant="danger">{error}</Alert>;
        }
        return (
            <Stack>
                {messages.map((message, i) => {
                    return <Post key={childrens[i]} message={message} />;
                })}
            </Stack>
        );
    }, [messages, error]);

    return <Posts />;
}
