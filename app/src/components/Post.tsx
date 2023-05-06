import { type IMessage } from '@model/message';
import { type IUser } from '@model/user';
import { useContext, useEffect, useState } from 'react';
import { Button, Col, Container, Image, Row } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from 'src/contexts';
import { fetchApi } from '../api/fetch';
import { apiUserBase } from '../api/routes';
import * as Icon from 'react-bootstrap-icons';

interface PostProps {
    message: IMessage;
}

function Post({ message }: PostProps): JSX.Element {
    const [user, setUser] = useState<IUser | null>(null);

    const [authState] = useContext(AuthContext);
    const navigator = useNavigate();

    useEffect(() => {
        fetchApi<IUser>(
            `${apiUserBase}/${message.creator}`,
            { method: 'GET' },
            null,
            (user) => {
                setUser(() => user);
            },
            (error) => {
                // TODO: rifare la richiesta
                console.log(error);
            },
        );
    }, [message.creator]);

    const profiloUrl = user !== null ? `/user/${user.username}` : '/404';

    return (
        <Row className="g-4" as="article" role="article">
            <Col xs={2} md={1.5} xl={1} className="pe-0 flex-row-reverse">
                {user != null && (
                    <Image
                        className="w-100 float-end"
                        src={user.profile_pic}
                        alt="profile image"
                        style={{ minWidth: '3rem', maxWidth: '5rem' }}
                        roundedCircle
                    />
                )}
            </Col>
            <Col>
                <Container className="d-flex justify-content-center flex-column pb-4">
                    <Row>
                        <div>
                            <a href={profiloUrl} className="text-decoration-none ">
                                <span className="fs-4 fw-bolder"> {user?.name}</span>
                            </a>
                            <a href={profiloUrl} className="text-decoration-none ">
                                <span className="fw-light"> @{user?.username} </span>
                            </a>
                            <span className="fw-light"> {message.date.toString()} </span>{' '}
                            {message.channel !== undefined && (
                                <span className="fw-light">
                                    <Link to={`/channel/${message.channel}`}>{message.channel}</Link>
                                </span>
                            )}
                            {/* TODO: transform in user good date. (like 1h or similiar */}
                        </div>
                    </Row>
                    <Row>
                        <div>
                            <Button className="me-3">
                                <span className="fw-light pe-2"> {message.posReaction.length} </span>
                                {user !== null && message.posReaction.includes(user.username) ? (
                                    <Icon.HandThumbsUpFill width={18} />
                                ) : (
                                    <Icon.HandThumbsUp width={18} />
                                )}
                            </Button>
                            <Button className="me-3">
                                <span className="fw-light pe-2"> {message.negReaction.length} </span>
                                {user !== null && message.negReaction.includes(user.username) ? (
                                    <Icon.HandThumbsDownFill width={18} />
                                ) : (
                                    <Icon.HandThumbsDown width={18} />
                                )}
                            </Button>
                        </div>
                    </Row>
                    <Row
                        onClick={() => {
                            navigator(`/message/${message._id.toString()}`);
                        }}
                    >
                        <p>
                            {message.content.data}{' '}
                            {/* TODO: mostrare in modo differente a seconda del tipo, esempio imamgine o simile, questo sta ancora un altro compontent */}
                        </p>
                    </Row>
                    {authState !== null && (
                        <Row>
                            {' '}
                            <Link to={`/addpost/${message._id.toString()}`}>Replay</Link>{' '}
                        </Row>
                    )}
                </Container>
            </Col>
        </Row>
    );
}

export default Post;
