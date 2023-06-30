import { type IMessage } from '@model/message';
import { useContext, useEffect, useState } from 'react';
import { Alert, Button, Spinner, Stack } from 'react-bootstrap';
import { fetchApi } from 'src/api/fetch';
import { apiMessageBase } from 'src/api/routes';
import { AuthContext } from 'src/contexts';
import Post from './posts/Post';

interface PropsMessageIds {
    childrens: string[];
    notificationClear: (id: string) => void;
}

export default function NotificationListLoader({ childrens, notificationClear }: PropsMessageIds): JSX.Element {
    if (childrens.length === 0) return <></>;

    const [authState] = useContext(AuthContext);
    const [messages, setMessages] = useState<IMessage[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [hide, setHide] = useState<string[]>([]);
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
                        return (
                            <div key={message._id.toString()} hidden={hide.includes(message._id.toString())}>
                                <div
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'end',
                                        flexDirection: 'row-reverse',
                                    }}
                                >
                                    <Button
                                        onClick={() => {
                                            setHide(() => [...hide, message._id.toString()]);
                                            notificationClear(message._id.toString());
                                        }}
                                    >
                                        X
                                    </Button>
                                </div>
                                <Post key={message._id.toString()} message={message} />
                            </div>
                        );
                    })}
                </Stack>
            );
        }
    }

    return <Posts />;
}
