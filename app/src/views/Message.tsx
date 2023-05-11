import { type IMessage } from '@model/message';
import { useContext, useEffect, useState } from 'react';
import { Alert, Spinner, Button } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchApi } from 'src/api/fetch';
import { apiMessageBase } from 'src/api/routes';
import MessageListLoader from 'src/components/MessageListLoader';
import Post from 'src/components/Post';
import { AuthContext } from 'src/contexts';
import SidebarSearchLayout from 'src/layout/SidebarSearchLayout';

export default function Message(): JSX.Element {
    const navigate = useNavigate();
    const { id } = useParams();
    const [auth] = useContext(AuthContext);
    const [message, setMessage] = useState<IMessage | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id === undefined) navigate('/404');
        else
            fetchApi<IMessage>(
                `${apiMessageBase}/${id}`,
                { method: 'GET' },
                auth,
                (message) => {
                    setMessage(() => message);
                },
                (error) => {
                    setError(() => error.message);
                },
            );
    }, [id]);

    function MainPost(): JSX.Element {
        if (message === null && error === null) {
            return <Spinner animation="border" role="status" />;
        } else if (message === null) {
            return <Alert variant="danger">{error}</Alert>;
        } else {
            return <Post message={message} />;
        }
    }

    // TODO: maybe this can be a component
    function Comments(): JSX.Element {
        if (message === null) return <></>;
        return (
            <>
                <h3>Comments </h3>
                <MessageListLoader childrens={message.children.map((id) => id.toString())} />
            </>
        );
    }

    function Parent(): JSX.Element {
        // TODO: refactor me
        if (message !== null)
            if (message.parent !== undefined && message.parent !== null)
                return (
                    <Button
                        onClick={() => {
                            navigate(`/message/${message.parent.toString()}`);
                        }}
                    >
                        Commento Padre
                    </Button>
                );
        return <></>;
    }

    return (
        <SidebarSearchLayout>
            <Parent />
            <MainPost />
            <Comments />
        </SidebarSearchLayout>
    );
}
