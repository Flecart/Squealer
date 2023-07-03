import { AuthContext } from '../contexts';

import { useContext, useEffect, useState } from 'react';
import { type IUser } from '@model/user';
import { type ChannelResponse, type IChannel } from '@model/channel';
import { fetchApi } from 'src/api/fetch';
import { apiChannelBase, apiUser, apiBuyChannel } from 'src/api/routes';
import SidebarSearchLayout from 'src/layout/SidebarSearchLayout';
import { Stack, Alert, Spinner, Container, Button, Modal, Form } from 'react-bootstrap';
import { ChannelList } from 'src/components/ChannelList';
import { stringFormat } from 'src/utils';
import { channelCost } from '@model/channel';

function AddChannelModal(): JSX.Element {
    const [auth] = useContext(AuthContext);
    const [show, setShow] = useState<boolean>(false);
    const [successText, setSuccessText] = useState<string>('');
    const [errorText, setErrorText] = useState<string>('');
    const [channelName, setChannelName] = useState<string>('');
    const [channelType, setChannelType] = useState<'public' | 'private'>('public');

    const handleClose = (): void => {
        setShow(false);
    };

    const handleShow = (): void => {
        setShow(true);
    };

    const closeModalInSecs = (millisecs: number): void => {
        setTimeout(() => {
            setSuccessText('');
            setErrorText('');
            handleClose();
        }, millisecs);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault();

        if (channelName.length === 0) {
            setErrorText('Channel name cannot be empty');
            setTimeout(() => {
                setErrorText('');
            }, 2000);
            return;
        }

        fetchApi<ChannelResponse>(
            apiBuyChannel,
            {
                method: 'POST',
                body: JSON.stringify({
                    channelName,
                    type: channelType,
                }),
            },
            auth,
            (channel) => {
                setSuccessText(`Channel ${channel.channel} created!`);
                closeModalInSecs(2000);
            },
            (e) => {
                setErrorText(e.message ?? 'Error when buying the channel');
                closeModalInSecs(2000);
            },
        );
    };

    return (
        <>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Buy a channel</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    You can buy a channel, just enter the name of the channel. It will cost
                    <span className="fw-bold"> {channelCost}€</span>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-2" controlId="formGroupChannelName">
                            <Form.Label>Channel name:</Form.Label>
                            <Form.Control
                                value={channelName}
                                onChange={(e) => {
                                    setChannelName(e.target.value);
                                }}
                                type="text"
                                placeholder="Channel Name"
                            />
                        </Form.Group>
                        <Form.Check
                            type="switch"
                            label={'Channel type: ' + channelType}
                            onChange={() => {
                                setChannelType((prev) => (prev === 'public' ? 'private' : 'public'));
                            }}
                        />
                        <Button variant="primary" className="mt-2" type="submit">
                            {' '}
                            Buy{' '}
                        </Button>
                    </Form>
                    <div className="mt-3">
                        {successText.length > 0 && <Alert variant="success">{successText}</Alert>}
                        {errorText.length > 0 && <Alert variant="danger">{errorText}</Alert>}
                    </div>
                </Modal.Body>
            </Modal>
            <Stack>
                <Button
                    aria-label="add a channel"
                    title="add a channel"
                    variant="primary"
                    className="mb-3"
                    onClick={handleShow}
                >
                    Buy a channel
                </Button>
            </Stack>
        </>
    );
}

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
                <div className="d-flex flex-column align-items-center">
                    <h1>Caricamento Canali</h1>
                    <Spinner animation="border" />
                </div>
            );

        if (error !== null)
            return (
                <Stack className="text-center justify-content-center">
                    <h1>Error</h1>
                    <Alert variant="danger">{error}</Alert>
                </Stack>
            );
        if (channels !== null) {
            return (
                <>
                    {auth !== null && <AddChannelModal />}
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
