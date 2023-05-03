import { useEffect, useState } from 'react';
import { Spinner, Stack, Container } from 'react-bootstrap';
import Post from './Post';
import { type IMessage } from '@model/message';
import { fetchApi } from '../api/fetch';
import { apiMessageBase } from '../api/routes';

export function MakeFeed(): JSX.Element {
    // TODO: gestire il caricamento etc
    const [contents, setContents] = useState<IMessage[] | null>(null);

    useEffect(() => {
        fetchApi<IMessage[]>(
            `${apiMessageBase}`,
            { method: 'GET' },
            null,
            (contents) => {
                setContents(() => contents);
            },
            (error) => {
                console.log(error.message);
            },
        );
    }, []);
    const Feed = contents?.map((content: IMessage) => {
        return <Post key={content._id.toString()} message={content} />;
    });

    return (
        // xs={6} -> className="... col-xs-6 ..."
        <Stack className="d-flex col-xs-6 flex-column-reverse p-1">
            {contents !== null ? (
                Feed
            ) : (
                <Container className="justify-content-center">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </Container>
            )}
        </Stack>
    );
}
