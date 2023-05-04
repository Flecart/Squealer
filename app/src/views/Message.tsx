import { type IMessage } from '@model/message';
import { useContext, useEffect, useState } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchApi } from 'src/api/fetch';
import { apiMessageBase } from 'src/api/routes';
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

    function MianPost(): JSX.Element {
        if (message === null && error === null) {
            return <Spinner animation="border" role="status" />;
        } else if (message === null) {
            return <Alert variant="danger">{error}</Alert>;
        } else {
            return <Post message={message} />;
        }
    }

    return (
        <SidebarSearchLayout>
            <MianPost />
            {/* aggiungere  lle risposte */}
        </SidebarSearchLayout>
    );
}
