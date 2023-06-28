import { type IChannel } from '@model/channel';
import { type IUser } from '@model/user';
import { useContext, useEffect, useReducer } from 'react';
import { Alert, Spinner, Stack } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { fetchApi } from 'src/api/fetch';
import { apiChannelBase, apiUserBase } from 'src/api/routes';
import { AuthContext } from 'src/contexts';

interface LoaderState {
    loading: boolean;
    error: string | null;
    channel: IChannel[] | null;
    user: IUser | null;
    auth: string | null;
}

enum LoaderActionType {
    LOADING = 'LOADING',
    ERROR = 'ERROR',
    CHANNEL = 'CHANNEL',
    USER = 'USER',
}

interface LoaderAction {
    type: LoaderActionType;
    payload: any;
}

function reducer(state: LoaderState, action: LoaderAction): LoaderState {
    let stillLoading = true;
    if (state.auth === null) stillLoading = false;
    else if (state.channel === null && state.user === null) stillLoading = true;
    else if (state.channel !== null || state.user !== null) stillLoading = false;

    if (state.error !== null) stillLoading = false;

    switch (action.type) {
        case LoaderActionType.LOADING:
            return { ...state, loading: true, error: null };
        case LoaderActionType.ERROR:
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            return { ...state, loading: false, error: action.payload };
        case LoaderActionType.CHANNEL:
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            return { ...state, loading: stillLoading, channel: action.payload };
        case LoaderActionType.USER:
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            return { ...state, loading: stillLoading, user: action.payload };
    }
    return state;
}

const defaultState = { loading: true, error: null, channel: null, user: null, auth: null };

interface ChannelListLoaderProps {
    channels: string[];
}

export function ChannelListLoader({ channels }: ChannelListLoaderProps): JSX.Element {
    const [auth] = useContext(AuthContext);

    // @ts-expect-error eslint-disable-next-line
    const [state, dispatch] = useReducer(reducer, { ...defaultState, auth }) as [
        LoaderState,
        React.Dispatch<LoaderAction>,
    ];
    useEffect(() => {
        dispatch({ type: LoaderActionType.LOADING, payload: null });

        const params = new URLSearchParams(channels.map((s) => ['channels', s])).toString();
        fetchApi<IChannel[]>(
            `${apiChannelBase}/channels?${params}`,
            { method: 'GET' },
            auth,
            (channels) => {
                dispatch({ type: LoaderActionType.CHANNEL, payload: channels });
            },
            (error) => {
                dispatch({ type: LoaderActionType.ERROR, payload: error.message });
            },
        );
        if (auth !== null)
            fetchApi<IUser>(
                `${apiUserBase}/${auth.username}`,
                { method: 'Get' },
                auth,
                (user) => {
                    dispatch({ type: LoaderActionType.USER, payload: user });
                },
                (error) => {
                    dispatch({ type: LoaderActionType.ERROR, payload: error.message });
                },
            );
    }, [auth]);

    function Content(): JSX.Element {
        if (state.error !== null) return <Alert variant="danger">{state.error}</Alert>;
        if (state.loading) return <Spinner animation="border" variant="primary" />;
        if (state.channel !== null && state.user !== null)
            return <ChannelList channels={state.channel} user={state.user} />;

        return <Alert variant="info">Make a Search</Alert>;
    }

    return (
        <Stack>
            <Content />
        </Stack>
    );
}

export function ChannelList({ channels, user }: { channels: IChannel[]; user: IUser | null }): JSX.Element {
    return (
        <Stack>
            {channels.map(
                (channel: IChannel): JSX.Element => (
                    <ChannelRow key={channel.name} channel={channel} user={user} />
                ),
            )}
        </Stack>
    );
}
function ChannelRow({ channel, user }: { channel: IChannel; user: IUser | null }): JSX.Element {
    let join = false;
    if (user !== null) {
        join = user.channel.find((c) => c === channel.name) !== undefined;
    }

    return (
        <Stack direction="horizontal">
            <Link to={`/ channel / ${channel.name}`}>
                <span>{channel.name}</span>
            </Link>
            <span className="me-3 ps-3" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {channel.description}
            </span>

            <span className="ms-auto">
                {join && (
                    <span className="pe-3" style={{ color: 'var(--bs-red)' }}>
                        Joined
                    </span>
                )}
                <span className="ms-auto ">{channel.type}</span>
            </span>
        </Stack>
    );
}
