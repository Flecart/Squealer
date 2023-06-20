import { Container, Image, Row, Tab, Tabs } from 'react-bootstrap';
import { AuthContext } from '../contexts';
import { type IUser } from '@model/user';
import { type HttpError } from '@model/error';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchApi } from '../api/fetch';
import { apiMessageBase, apiUserBase } from 'src/api/routes';
import SidebarSearchLayout from 'src/layout/SidebarSearchLayout';
import { sortHighliths, sortRecently, type IMessage } from '@model/message';
import MessageListLoader from 'src/components/MessageListLoader';

function User(): JSX.Element {
    const [authState] = useContext(AuthContext);
    const { username } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState<IUser | null>(null);
    const [messages, setMessages] = useState<IMessage[] | null>(null);

    useEffect(() => {
        if (authState === null) {
            navigate('/login');
        }
    }, [authState, navigate]);

    const handleUserError = useCallback((error: HttpError): void => {
        console.log(error.message);
        if (error.status === 404) navigate('/404');
    }, []);

    const handleMessageError = useCallback((error: HttpError): void => {
        console.log(error.message);
    }, []);

    useEffect(() => {
        if (username === undefined) return;
        fetchApi<IUser>(
            `${apiUserBase}/${username}`,
            { method: 'GET' },
            null,
            (user) => {
                setUser(() => user);
            },
            handleUserError,
        );

        fetchApi<IMessage[]>(
            `${apiMessageBase}/user/${username}`,
            { method: 'GET' },
            null,
            (messages) => {
                setMessages(messages);
            },
            handleMessageError,
        );
    }, [username]);

    const permission = useMemo<boolean>(() => {
        if (user === null || authState === null) {
            return false;
        }
        return user.username === authState.username;
    }, [user, authState]);

    const handleTabChange = (key: string | null): void => {
        console.log(key);
        // TODO: set stuff of tab change...
    };

    return (
        <SidebarSearchLayout>
            <Container className="d-flex justify-content-center flex-column pb-4">
                <Row className="py-3 m-auto" style={{ maxWidth: '10rem', minWidth: '10rem' }}>
                    {user !== null && <Image src={user?.profile_pic} alt="profile image" roundedCircle />}
                </Row>
                {/* TODO: mettere schermata di loading, tipo scheletons */}
                <Row>
                    <h1 className="text-center">{user?.name ?? ' '}</h1>
                </Row>
                <Row>
                    <h2 className="text-center">@{username}</h2>
                </Row>
                <Row>
                    <p className="text-center">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                </Row>

                {/* TODO: edit profile button if the user is him self */}
            </Container>

            <Container as="main">
                {/* TODO: refactor tab element to have li childs as elements?? */}
                <Tabs
                    defaultActiveKey="hightlight" // TODO: decidere il default a seconda della route?, sarebbe bono, poi renderizzare solo tramite quello.
                    onSelect={handleTabChange}
                    className="mb-3"
                >
                    {/* TODO: forse i tabs dovrebbero essere dei componenti? dovremmo dare chiave, elemento, poi anche funzione (che carichi le cose, quindi credo vera
                            mente che sarebbe meglio farlo componente separato) */}
                    <Tab eventKey="hightlight" title="Highlight">
                        {/* Display posts in for loop if they exists */}

                        {messages !== null && (
                            <MessageListLoader
                                childrens={messages.map((a) => a._id.toString())}
                                compare={sortRecently}
                            />
                        )}
                    </Tab>
                    <Tab eventKey="posts" title="Last Posts">
                        {messages !== null && (
                            <MessageListLoader
                                childrens={messages.map((a) => a._id.toString())}
                                compare={sortHighliths}
                            />
                        )}
                    </Tab>
                </Tabs>
            </Container>
        </SidebarSearchLayout>
    );
}

export default User;
