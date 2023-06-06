import { ICategory, type Maps, type IMessage } from '@model/message';
import { type IUser } from '@model/user';
import { useCallback, useContext, useEffect, useState } from 'react';
import { Col, Container, Image, Row } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext, CategoryContext } from 'src/contexts';
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

    const getCategoryText = (Category: ICategory): string => {
        switch (Category) {
            case ICategory.NORMAL:
                return '';
                break;

            case ICategory.POPULAR:
                return 'POPULAR!';
                break;

            case ICategory.UNPOPULAR:
                return 'UNPOPULAR!';
                break;

            case ICategory.CONTROVERSIAL:
                return 'CONTROVERSIAL!';
                break;
        }
    };

    const getCategoryClass = (Category: ICategory): string => {
        switch (Category) {
            case ICategory.NORMAL:
                return '';
                break;

            case ICategory.POPULAR:
                return 'text-success';
                break;

            case ICategory.UNPOPULAR:
                return 'text-danger';
                break;

            case ICategory.CONTROVERSIAL:
                return 'text-warning';
                break;
        }
    };

    const [categoryState, setCategoryState] = useState<number>(message.category);

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
        if (message.content === undefined) return <></>;
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
<<<<<<< HEAD
        } else if (message.content.type === 'maps') {
            const data: Maps = message.content.data as Maps;
            return <Map positions={data.positions} />;
        } else {
=======
        } else if (message.content.type === 'text') {
>>>>>>> c0e47be (feat(app): temp)
            return <p>{message.content.data as string} </p>;
        }
        return <>{message.content.type}</>;
    }, [message.content]);

    return (
        <Row className="g-4" as="article" role="article">
            <Col xs={2} md={1.5} xl={1} className="pe-0 flex-row-reverse">
                <Image
                    className="w-100 float-end"
                    src={user?.profile_pic}
                    alt="profile image"
                    style={{ minWidth: '3rem', maxWidth: '5rem' }}
                    roundedCircle
                />
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
                            {categoryState !== 0 && (
                                <span className={`container-fluid ${getCategoryClass(categoryState) ?? ''}`}>
                                    {getCategoryText(categoryState)}
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
                        {/* TODO: transform in user good date. (like 1h or similiar */}
                    </Row>
                    <Row>
                        <CategoryContext.Provider value={[null, setCategoryState]}>
                            <PostButtons messageId={message._id.toString()} reactions={message.reaction} />
                        </CategoryContext.Provider>
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
