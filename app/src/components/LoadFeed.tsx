import { useContext, useEffect, useState } from 'react';
import { Spinner, Stack, Container } from 'react-bootstrap';
import Post from './posts/Post';
import { type IMessage } from '@model/message';
import { fetchApi } from '../api/fetch';
import { apiFeedBase } from '../api/routes';
import { AuthContext } from '../contexts';

export function MakeFeed(): JSX.Element {
    // TODO: gestire il caricamento etc
    const [contents, setContents] = useState<IMessage[] | null>(null);
    const [authState] = useContext(AuthContext);

    useEffect(() => {
        fetchApi<IMessage[]>(
            `${apiFeedBase}`,
            { method: 'GET' },
            authState,
            (contents) => {
                setContents(() => contents);
            },
            (error) => {
                console.log(error.message);
            },
        );
    }, []);
    const feed = contents?.map((content: IMessage) => {
        return <Post key={content._id.toString()} message={content} />;
    });

    return (
        // xs={6} -> className="... col-xs-6 ..."
        <Stack className="d-flex col-xs-6 flex-column-reverse p-1">
            {contents !== null ? (
                feed
            ) : (
                <Container className="justify-content-center d-flex">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </Container>
            )}
        </Stack>
    );
}
