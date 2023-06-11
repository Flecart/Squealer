import { AuthContext } from '../contexts';

import { useContext, useEffect, useState } from 'react';
import { type IUser } from '@model/user';
import { type IChannel } from '@model/channel';
import { fetchApi } from 'src/api/fetch';
import { apiChannelBase, apiUserBase } from 'src/api/routes';
import { Link } from 'react-router-dom';
import SidebarSearchLayout from 'src/layout/SidebarSearchLayout';
import { Stack, Alert, Spinner, Container } from 'react-bootstrap';

export default function Channels(): JSX.Element {
    const [auth] = useContext(AuthContext);
    const [user, setUser] = useState<null | IUser>(null);
    const [error, setError] = useState<null | string>(null);
    const [pendingU, setPendingUser] = useState(auth !== null); // se non c'è un utente allora non deve fare la richiesta
    const [pendingC, setPendingChannel] = useState(true);
    const [channels, setChannels] = useState<null | IChannel[]>(null);

    const pending = pendingU || pendingC;

    useEffect(() => {
        if (auth != null) {
            fetchApi<IUser>(
                `${apiUserBase}/${auth.username}`,
                { method: 'Get' },
                auth,
                (user) => {
                    setUser(user);
                    setPendingUser(false);
                },
                (e) => {
                    setError(e.message);
                    setPendingUser(false);
                },
            );
        }
        fetchApi<IChannel[]>(
            `${apiChannelBase}`,
            { method: 'Get' },
            auth,
            (channel) => {
                setChannels(channel);
                setPendingChannel(false);
            },
            (e) => {
                setError(e.message);
                setPendingChannel(false);
            },
        );
    }, [auth]);

    function Content(): JSX.Element {
        if (pending)
            return (
                <Stack>
                    <h1>Caricamento Canali</h1>
                    <Spinner animation="border" />
                </Stack>
            );

        if (error !== null)
            return (
                <Stack className="text-center justify-content-center">
                    <h1>Errore</h1>
                    <Alert variant="danger">{error}</Alert>
                </Stack>
            );
        if (channels !== null) {
            return (
                <>
                    <Stack>
                        {channels.map(
                            (channel: IChannel): JSX.Element => (
                                <ChannelRow key={channel.name} channel={channel} user={user} />
                            ),
                        )}
                    </Stack>
                </>
            );
        }
        return <></>;
    }

    return (
        <SidebarSearchLayout>
            <Container>
                <Content />
            </Container>
        </SidebarSearchLayout>
    );
}

function ChannelRow({ channel, user }: { channel: IChannel; user: IUser | null }): JSX.Element {
    let join = false;
    if (user !== null) {
        console.log(user.channel);
        join = user.channel.find((c) => c === channel.name) !== undefined;
    }

    return (
        <Stack direction="horizontal">
            <Link to={`/channel/${channel.name}`}>
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
