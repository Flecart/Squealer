import { useContext, useEffect, useState } from 'react';
import { Button, Form, Spinner, Stack } from 'react-bootstrap';
import { fetchApi } from 'src/api/fetch';
import { AuthContext } from 'src/contexts';
import MessageListPageLoader from './MessageListPagerLoader';

interface MessageSortComponentProps {
    def?: string[];
    reqInit: RequestInit;
    url: string;
}

interface MessageSortComponentState {
    loading: boolean;
    error: string | null;
    messages: string[] | null;
    sortBy: string;
}

export default function MessageSortComponent({ def, reqInit, url }: MessageSortComponentProps): JSX.Element {
    const thereIsDefault = def !== undefined;
    const defState = {
        loading: !thereIsDefault,
        error: null,
        messages: thereIsDefault ? def : null,
        sortBy: 'recently',
    };
    const [state, setState] = useState<MessageSortComponentState>(defState);

    const [auth] = useContext(AuthContext);

    const getMessage = (): void => {
        if (state.loading) return;
        setState({ ...state, loading: true, error: null });

        fetchApi<string[]>(
            url + `?sort=${state.sortBy}`,
            reqInit,
            auth,
            (data) => {
                setState({ ...state, loading: false, messages: data });
            },
            (error) => {
                setState({ ...state, loading: false, error: error.message });
            },
        );
    };

    useEffect(() => {
        if (state.messages === null) return;
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
                    <p>{state.error}</p>
                    <Button variant="primary" onClick={getMessage}>
                        Try again
                    </Button>
                </div>
            );
        }
        return (
            <Stack direction="vertical">
                <div className="d-flex justify-content-center">
                    <Form.Select
                        aria-label="TODO"
                        value={state.sortBy}
                        onChange={(e) => {
                            setState({ ...state, sortBy: e.target.value });
                        }}
                    >
                        <option value="reactions-desc">Reactions (desc)</option>
                        <option value="reactions-asc">Reactions (asc)</option>
                        <option value="popularity">Popularity</option>
                        <option value="risk">Risk</option>
                        <option value="unpopularity">Unpopularity</option>
                        <option value="recently">Recently</option>
                    </Form.Select>
                </div>
                {state.messages !== null && <MessageListPageLoader childrens={state.messages} />}
            </Stack>
        );
    }
    return <Content />;
}
