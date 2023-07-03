import { useContext, useEffect, useState } from 'react';
import { Button, Form, Spinner, Stack } from 'react-bootstrap';
import { fetchApi } from 'src/api/fetch';
import { AuthContext } from 'src/contexts';
import MessageListPageLoader from './MessageListPagerLoader';

interface MessageSortComponentProps {
    messageIds?: string[];
    reqInit: RequestInit;
    url: string;
}

interface MessageSortComponentState {
    loading: boolean;
    error: string | null;
    messageIds: string[] | null;
    sortBy: string;
    firstTime: boolean;
}

export default function MessageSortComponent({ messageIds, reqInit, url }: MessageSortComponentProps): JSX.Element {
    const hasMessages = messageIds !== undefined;
    const defState = {
        loading: false,
        error: null,
        messageIds: hasMessages ? messageIds : null,
        sortBy: 'recent-asc',
        firstTime: hasMessages,
    };
    const [state, setState] = useState<MessageSortComponentState>(defState);

    const [auth] = useContext(AuthContext);

    const getMessage = (): void => {
        if (state.loading) return;
        setState({ ...state, loading: true, error: null, firstTime: false });

        fetchApi<string[]>(
            url + `?sort=${state.sortBy}`,
            reqInit,
            auth,
            (data) => {
                setState({ ...state, loading: false, messageIds: data });
            },
            (error) => {
                setState({ ...state, loading: false, error: error.message });
            },
        );
    };

    useEffect(() => {
        if (state.firstTime) return;
        getMessage();
    }, [state.sortBy]);
    function Content(): JSX.Element {
        if (state.loading) {
            return (
                <div className="d-flex justify-content-center">
                    <Spinner animation="border" variant="primary" />
                </div>
            );
        } else if (state.error !== null) {
            return (
                <div className="d-flex justify-content-center">
                    <div className="row">
                        <p>{state.error}</p>
                    </div>
                    <div className="row">
                        <Button variant="primary" onClick={getMessage}>
                            Try again
                        </Button>
                    </div>
                </div>
            );
        }
        return (
            <Stack direction="vertical">
                <div className="d-flex justify-content-center mb-4">
                    <Form.Select
                        aria-label="Sort By selection"
                        value={state.sortBy}
                        onChange={(e) => {
                            setState({ ...state, sortBy: e.target.value });
                        }}
                    >
                        <option value="reactions-desc">Sort By: Reactions (desc)</option>
                        <option value="reactions-asc">Sort By: Reactions (asc)</option>
                        <option value="popularity">Sort By: Popularity</option>
                        <option value="risk">Sort By: Risk</option>
                        <option value="unpopularity">Sort By: Unpopularity</option>
                        <option value="recent-asc">Sort By: Most recent</option>
                        <option value="recent-desc">Sort By: Oldest</option>
                    </Form.Select>
                </div>
                {state.messageIds !== null && <MessageListPageLoader childrens={state.messageIds} />}
            </Stack>
        );
    }
    return <Content />;
}
