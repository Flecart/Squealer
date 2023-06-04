import { type IMessage, type Maps } from '@model/message';
import { type IUser } from '@model/user';
import { useCallback, useContext, useEffect, useState } from 'react';
import { Col, Container, Image, Row } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from 'src/contexts';
import { fetchApi } from '../api/fetch';
import { apiUserBase } from '../api/routes';
import { toHumanReadableDate } from 'src/utils';
import { imageBase } from 'src/api/routes';
import Map from './Map';
import PostButtons from './PostButtons';

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

    const renderMessageContent = useCallback(() => {
        if (message.content === undefined) return null;
        // TODO: completare i tipi

        if (message.content.type === 'image') {
            return <Image src={`${imageBase}/${message.content.data as string}`} fluid />;
        } else if (message.content.type === 'video') {
            return (
                <Container>
                    <video className="mb-3 w-100" controls>
                        <source src={`${imageBase}/${message.content.data as string}`}></source>
                    </video>
                </Container>
            );
        } else if (message.content.type === 'maps') {
            const data: Maps = message.content.data as Maps;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            return <Map lat={data.latitude} lng={data.longitude} />;
        } else {
            return <p>{message.content.data as string} </p>;
        }
    }, [message.content]);

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
                            <span className="fw-light"> {toHumanReadableDate(message.date.toString())} </span>{' '}
                            {message.channel !== undefined && (
                                <span className="fw-light">
                                    <Link to={`/channel/${message.channel}`}>{message.channel}</Link>
                                </span>
                            )}
                            {/* TODO: transform in user good date. (like 1h or similiar */}
                        </div>
                    </Row>
                    <Row
                        onClick={() => {
                            navigator(`/message/${message._id.toString()}`);
                        }}
                    >
                        {renderMessageContent()}
                    </Row>
                    <Row>
                        <PostButtons messageId={message._id.toString()} reactions={message.reaction} />
                    </Row>

                    <Row>
                        {authState !== null && (
                            <Link to={`/addpost/${message._id.toString()}`} className="me-3">
                                Replay
                            </Link>
                        )}
                    </Row>
                </Container>
            </Col>
        </Row>
    );
}

export default Post;
