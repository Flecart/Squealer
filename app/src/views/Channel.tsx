import { useEffect, useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchApi } from 'src/api/fetch';
import { type IChannel } from '@model/channel';
import { apiChannelBase } from 'src/api/routes';
import SidebarSearchLayout from 'src/layout/SidebarSearchLayout';
import { Alert, Container, Row, Tab, Tabs } from 'react-bootstrap';
import { AuthContext } from 'src/contexts';
import MessageListLoader from 'src/components/MessageListLoader';

export default function Channel(): JSX.Element {
    const navigate = useNavigate();
    const { channelId } = useParams();
    const [channel, setChannel] = useState<IChannel | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [auth] = useContext(AuthContext);

    useEffect(() => {
        if (channelId === undefined) navigate('/404');
        else
            fetchApi<IChannel>(
                `${apiChannelBase}/${channelId}`,
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

    return (
        <SidebarSearchLayout>
            <Container className="d-flex justify-content-center flex-column pb-4">
                <Row>
                    <h1 className="text-center">{channel?.name}</h1>
                </Row>
                <Row>
                    <h2 className="text-center">{channel?.description}</h2>
                </Row>
                {error !== null && (
                    <Row>
                        <Alert variant="danger">{error}</Alert>
                    </Row>
                )}
            </Container>

            <Container as="main">
                {/* TODO: refactor tab element to have li childs as elements?? */}
                <Tabs
                    defaultActiveKey="hightlight" // TODO: decidere il default a seconda della route?, sarebbe bono, poi renderizzare solo tramite quello.
                    className="mb-3"
                >
                    {/* TODO: forse i tabs dovrebbero essere dei componenti? dovremmo dare chiave, elemento, poi anche funzione (che carichi le cose, quindi credo vera
                            mente che sarebbe meglio farlo componente separato) */}
                    <Tab eventKey="hightlight" title="Highlight">
                        {/* Display posts in for loop if they exists */}

                        {channel !== null && (
                            <MessageListLoader childrens={channel.messages.map((a) => a.toString())} />
                        )}
                    </Tab>
                    <Tab eventKey="posts" title="Last Posts"></Tab>
                </Tabs>
            </Container>
        </SidebarSearchLayout>
    );
}
