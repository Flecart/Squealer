import { useContext, useEffect, useState } from 'react';
import { Spinner, Stack, Container, Button } from 'react-bootstrap';
import { fetchApi } from '../api/fetch';
import { apiFeedBase } from '../api/routes';
import { AuthContext } from '../contexts';
import MessageListPageLoader from './MessageListPagerLoader';

export function MakeFeed(): JSX.Element {
    // TODO: gestire il caricamento etc ??
    const [contents, setContents] = useState<string[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [authState] = useContext(AuthContext);

    const loadFeed = (): void => {
        fetchApi<string[]>(
            apiFeedBase,
            { method: 'GET' },
            authState,
            (contents) => {
                setContents(() => contents);
            },
            (error) => {
                setError(() => error.message);
            },
        );
    };

    useEffect(() => {
        loadFeed();
    }, []);

    function Content(): JSX.Element {
        if (contents !== null) return <MessageListPageLoader childrens={contents} />;
        else if (error == null)
            return (
                <Container className="justify-content-center d-flex">
                    <Spinner className="m-1" animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </Container>
            );
        else
            return (
                <Container className="justify-content-center d-flex flex-column">
                    <p>{error}</p>
                    <Button onClick={loadFeed}>Retry Loading messages</Button>
                </Container>
            );
    }

    return (
        // xs={6} -> className="... col-xs-6 ..."
        <Stack className="d-flex col-xs-6 flex-column-reverse p-1">
            <Content />
        </Stack>
    );
}
