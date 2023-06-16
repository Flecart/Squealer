import { useEffect, useState, useContext } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { fetchApi } from 'src/api/fetch';
import { type ChannelResponse, ChannelType, type IChannel } from '@model/channel';
import { apiChannelBase } from 'src/api/routes';
import SidebarSearchLayout from 'src/layout/SidebarSearchLayout';
import { Alert, Container, Row, Stack, Tab, Tabs } from 'react-bootstrap';
import { AuthContext } from 'src/contexts';
import MessageListLoader from 'src/components/MessageListLoader';
import ChannelMembers from 'src/components/ChannelMembers';
import * as Icon from 'react-bootstrap-icons';
import { sortHighliths, sortRecently } from '@model/message';
import { type AuthResponse } from '@model/auth';

interface HeaderChannelProps {
    channel: IChannel | null;
    auth: AuthResponse | null;
    error: string | null;
}

export default function Channel(): JSX.Element {
    const navigate = useNavigate();
    let { channelId } = useParams();
    const location = useLocation();

    if (channelId === undefined) {
        if (location.hash === '') navigate('/404');
        channelId = location.hash;
    }
    const [channel, setChannel] = useState<IChannel | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [auth] = useContext(AuthContext);

    useEffect(() => {
        if (channelId === undefined) navigate('/404');
        else
            fetchApi<IChannel>(
                `${apiChannelBase}/${channelId.replace('#', '%23')}`,
                { method: 'GET' },
                auth,
                (channel) => {
                    setChannel(() => channel);
                },
                (error) => {
                    setError(() => error.message);
                },
            );
    }, [channelId]);
    console.log(channel);

    return (
        <SidebarSearchLayout>
            <Header channel={channel} auth={auth} error={error} />

            <Container as="main">
                {/* TODO: refactor tab element to have li childs as elements?? */}
                {channel !== null && channel.type === ChannelType.USER ? (
                    <MessageListLoader childrens={channel.messages.map((a) => a.toString())} compare={sortRecently} />
                ) : (
                    <Tabs
                        defaultActiveKey="hightlight" // TODO: decidere il default a seconda della route?, sarebbe bono, poi renderizzare solo tramite quello.
                        className="mb-3"
                    >
                        {/* TODO: forse i tabs dovrebbero essere dei componenti? dovremmo dare chiave, elemento, poi anche funzione (che carichi le cose, quindi credo vera
                            mente che sarebbe meglio farlo componente separato) */}
                        <Tab eventKey="hightlight" title="Highlight">
                            {channel !== null && (
                                <MessageListLoader
                                    childrens={channel.messages.map((a) => a.toString())}
                                    compare={sortHighliths}
                                />
                            )}
                        </Tab>
                        <Tab eventKey="new" title="Latest">
                            {/* Display posts in for loop if they exists */}

                            {channel !== null && (
                                <MessageListLoader
                                    childrens={channel.messages.map((a) => a.toString())}
                                    compare={sortRecently}
                                />
                            )}
                        </Tab>
                        {/* TODO replace this */}
                        {channel !== null && !channel.name.startsWith('#') && (
                            <Tab eventKey="posts" title="Members">
                                {/* TODO: aggiungere la grafica */}
                                <ChannelMembers channel={channel} />
                            </Tab>
                        )}
                    </Tabs>
                )}
            </Container>
        </SidebarSearchLayout>
    );
}

function Header({ channel, auth, error }: HeaderChannelProps): JSX.Element {
    if (channel === null) return <></>;
    return (
        <Container className="d-flex justify-content-center flex-column pb-4">
            <Row>
                <h1 className="text-center">
                    {channel.type === ChannelType.USER && auth !== null
                        ? getUserName(channel.name, auth.username)
                        : channel.name}
                </h1>
            </Row>
            {channel.type !== ChannelType.USER && (
                <Row>
                    <h4 className="text-center">{channel?.description}</h4>
                </Row>
            )}
            {error !== null && (
                <Row>
                    <Alert variant="danger">{error}</Alert>
                </Row>
            )}
            <Stack direction="horizontal" className="justify-content-center" gap={3}>
                <JoinAndNotify channel={channel} auth={auth} error={error} />
            </Stack>
        </Container>
    );
}

function JoinAndNotify({ channel, auth }: HeaderChannelProps): JSX.Element {
    const navigate = useNavigate();
    if (channel === null) return <></>;
    if (auth === null) return <></>;
    if (!(channel.type === ChannelType.PUBLIC || channel.type === ChannelType.SQUEALER)) {
        return <></>;
    }
    const current = channel.users.filter((user) => user.user === auth.username)[0];

    const [notification, setNotification] = useState<boolean>(current?.notification ?? false);
    const join = current !== undefined;
    const toggleNotification = (): void => {
        const newStatus = !notification;
        fetchApi<ChannelResponse>(
            `${apiChannelBase}/${channel.name}/notify`,
            {
                method: 'POST',
                body: JSON.stringify({
                    notify: newStatus,
                }),
            },
            auth,
            (_) => {
                setNotification(() => newStatus);
            },
            (_) => {},
        );
    };
    const toggleJoin = (): void => {
        fetchApi<ChannelResponse>(
            `${apiChannelBase}/${channel.name}/${!join ? 'join' : 'leave'}`,
            {
                method: 'POST',
            },
            auth,
            (_) => {
                navigate(0);
            },
            (_) => {},
        );
    };

    return (
        <>
            {!join ? (
                <span className="gap-2" onClick={toggleJoin}>
                    Entra
                    <Icon.BoxArrowInLeft />
                </span>
            ) : (
                <>
                    <span className="gap-2" onClick={toggleJoin}>
                        Esci <Icon.BoxArrowLeft />
                    </span>
                    <span onClick={toggleNotification}>{notification ? <Icon.Bell /> : <Icon.BellSlash />}</span>
                </>
            )}
        </>
    );
}

function getUserName(channelname: string, myname: string): string {
    const channel = channelname.substring(1);
    const name = channel.split('-');
    if (name[0] === myname) return name[1];
    else return name[0];
}
