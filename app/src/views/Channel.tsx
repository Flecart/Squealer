import { useEffect, useState, useContext, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { fetchApi } from 'src/api/fetch';
import { type ChannelResponse, ChannelType, type IChannel } from '@model/channel';
import { apiChannelBase, apiChannelGet, apiChannelJoin, apiChannelLeave, apiChannelNotify } from 'src/api/routes';
import SidebarSearchLayout from 'src/layout/SidebarSearchLayout';
import { Alert, Container, Row, Spinner, Stack, Tab, Tabs } from 'react-bootstrap';
import { AuthContext } from 'src/contexts';
import ChannelMembers from 'src/components/ChannelMembers';
import * as Icon from 'react-bootstrap-icons';
import { type AuthResponse } from '@model/auth';
import MessageSortComponent from 'src/components/MessageSortComponent';
import { getUsernameFromUserChannel, stringFormat } from '../utils';
import MessageListPageLoader from 'src/components/MessageListPagerLoader';

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
                stringFormat(apiChannelGet, [channelId.replace('#', '%23')]),
                { method: 'GET' },
                auth,
                (channel) => {
                    setChannel(() => channel);
                },
                (error) => {
                    if (error.status === 404) navigate('/404');
                    setError(() => error.message);
                },
            );
    }, [channelId]);

    const Content = useCallback(() => {
        if (channel === null || channel === undefined)
            return (
                <div className="d-flex justify-content-center">
                    <Spinner animation="border" variant="primary" />
                </div>
            );
        if (channel.type === ChannelType.USER) {
            return <MessageListPageLoader childrens={channel.messages.map((a) => a.toString())} />;
        }
        const MessageSortList = (
            <MessageSortComponent
                messageIds={channel?.messages.map((a) => a.toString())}
                reqInit={{ method: 'GET' }}
                url={`${apiChannelBase}/${channel.name.replace('#', '%23')}/messagesId`}
            />
        );

        if (channel.type === ChannelType.HASHTAG || channel.name.startsWith('#')) {
            return MessageSortList;
        }

        return (
            <Tabs
                defaultActiveKey="posts" // TODO: decidere il default a seconda della route?, sarebbe bono, poi renderizzare solo tramite quello.
                className="mb-3"
            >
                <Tab eventKey="posts" title="Post">
                    {MessageSortList}
                </Tab>
                <Tab eventKey="member" title="Members">
                    <ChannelMembers channel={channel} />
                </Tab>
            </Tabs>
        );
    }, [channel]);

    return (
        <SidebarSearchLayout>
            <Header channel={channel} auth={auth} error={error} />
            <Container as="main">
                {/* TODO: refactor tab element to have li childs as elements?? */}
                {channel !== null && <Content />}
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
                        ? getUsernameFromUserChannel(channel.name, auth.username)
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
            stringFormat(apiChannelNotify, [channel.name]),
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
            stringFormat(!join ? apiChannelJoin : apiChannelLeave, [channel.name]),
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
