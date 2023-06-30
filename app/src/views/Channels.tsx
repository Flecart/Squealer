import { AuthContext } from '../contexts';

import { useContext, useEffect, useState } from 'react';
import { type IUser } from '@model/user';
import { type IChannel } from '@model/channel';
import { fetchApi } from 'src/api/fetch';
import { apiChannelBase, apiUser, apiUserBase } from 'src/api/routes';
import SidebarSearchLayout from 'src/layout/SidebarSearchLayout';
import { Stack, Alert, Spinner, Container } from 'react-bootstrap';
import { ChannelList } from 'src/components/ChannelList';
import { stringFormat } from 'src/utils';

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
                stringFormat(apiUser, [auth.username]),
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
                    <ChannelList channels={channels} user={user} />
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
