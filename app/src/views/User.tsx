import { Container, Row, Tab, Tabs } from 'react-bootstrap';
import Image from 'react-bootstrap/Image';
import Post from '../components/NewPost';
import { type IUser } from '@model/user';
import { type HttpError } from '@model/error';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchApi } from '../api/fetch';
import { apiMessageBase, apiUserBase } from 'src/api/routes';
import SidebarSearchLayout from 'src/layout/SidebarSearchLayout';
import { type IMessage } from '@model/message';

function User(): JSX.Element {
    const { username } = useParams();
    const navigator = useNavigate();

    const [user, setUser] = useState<IUser | null>(null);
    const [messages, setMessages] = useState<IMessage[] | null>(null);

    const handleUserError = useCallback((error: HttpError): void => {
        console.log(error.message);
        if (error.status === 404) navigator('/404');
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

    const handleTabChange = (key: string | null): void => {
        console.log(key);
        // TODO: set stuff of tab change...
    };

    return (
        <SidebarSearchLayout>
            <>
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

                    <Row>
                        <div className="d-flex justify-content-around">
                            <span>
                                {' '}
                                <b>1Mil</b> Followers{' '}
                            </span>
                            <span>
                                {' '}
                                <b>1Mil</b> Following{' '}
                            </span>
                        </div>
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

                            {messages?.map((message) => (
                                <Post key={message._id as unknown as string} message={message} />
                            ))}
                        </Tab>
                        <Tab eventKey="posts" title="Last Posts">
                            hello
                        </Tab>
                    </Tabs>
                </Container>
            </>
        </SidebarSearchLayout>
    );
}

export default User;
