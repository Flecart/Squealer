import { type IMessage } from '@model/message';
import { useCallback, useContext, useEffect, useState } from 'react';
import { Alert, Spinner, Button } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchApi } from 'src/api/fetch';
import { apiMessageParent } from 'src/api/routes';
import MessageListPageLoader from 'src/components/MessageListPagerLoader';
import Post from 'src/components/posts/Post';
import { AuthContext } from 'src/contexts';
import SidebarSearchLayout from 'src/layout/SidebarSearchLayout';
import { stringFormat } from 'src/utils';

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
                stringFormat(apiMessageParent, [id]),
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
            return (
                <div className="d-flex justify-content-center">
                    <Spinner className="my-1" animation="border" role="status" />;
                </div>
            );
        } else if (message === null) {
            return <Alert variant="danger">{error}</Alert>;
        } else {
            return <Post message={message} />;
        }
    }

    // TODO: maybe this can be a component
    const Comments = useCallback(() => {
        if (message === null) return <></>;
        return (
            <>
                <h3>Comments </h3>
                <MessageListPageLoader childrens={message.children.map((id) => id.toString())} />
            </>
        );
    }, [message]);

    const Parent = useCallback(() => {
        if (message !== null)
            if (message.parent !== undefined && message.parent !== null)
                return (
                    <Button
                        onClick={() => {
                            // @ts-expect-error parent check is above.
                            navigate(`/message/${message.parent.toString()}`);
                        }}
                    >
                        Go to Main message
                    </Button>
                );
        return <></>;
    }, [message]);

    return (
        <SidebarSearchLayout>
            <Parent />
            <MainPost />
            <Comments />
        </SidebarSearchLayout>
    );
}
