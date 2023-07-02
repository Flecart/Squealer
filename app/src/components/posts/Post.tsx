import { ICategory, type Maps, type IMessage } from '@model/message';
import { type IUser, UserRoles } from '@model/user';
import { useCallback, useContext, useEffect, useState } from 'react';
import { Col, Container, Image, Row } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext, CategoryContext } from 'src/contexts';
import { fetchApi } from 'src/api/fetch';
import { stringFormat, toEnglishString, toHumanReadableDate } from 'src/utils';
import { imageBase, apiUser } from 'src/api/routes';
import Map from 'src/components/Map';
import PostButtons from './PostButtons';
import 'src/scss/Post.scss';
import { Eye as EyeIcon } from 'react-bootstrap-icons';
import * as Icon from 'react-bootstrap-icons';

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
            stringFormat(apiUser, [message.creator]),
            { method: 'GET' },
            null,
            (user) => {
                setUser(() => user);
            },
            (_) => {
                // TODO: rifare la richiesta
            },
            true,
        );
    }, [message.creator]);

    const profiloUrl = user !== null ? `/user/${user.username}` : '/404';

    const renderMessageContent = useCallback(() => {
        if (message.content === undefined) return <></>;
        if (message.content.type === 'image') {
            return (
                <Image
                    src={`${imageBase}/${message.content.data as string}`}
                    alt="Immagine Post"
                    className="mb-3 mt-2"
                    style={{ maxWidth: '500px' }}
                    fluid
                />
            );
        } else if (message.content.type === 'video') {
            return (
                <Container>
                    <video className="mb-3 mt-2" style={{ maxWidth: '500px' }} controls>
                        <source src={`${imageBase}/${message.content.data as string}`}></source>
                    </video>
                </Container>
            );
        } else if (message.content.type === 'maps') {
            const data: Maps = message.content.data as Maps;
            return <Map className="mb-3 mt-2" positions={data.positions} />;
        } else {
            const textMessage = message.content.data as string;
            // e.g. @useralphanumeric, but not @user@user
            const mentionRegex = /\B@(\w+)$/;

            // begin with $ or # and then alphanumeric
            const channelsRegex = /\B([#§])\w+$/;
            const parts = textMessage.split(' ');

            return (
                <p className="post-paragraph-text">
                    {parts.map((part, index) => {
                        if (mentionRegex.test(part)) {
                            return (
                                <a className="post-user-link" href={`/user/${part.slice(1)}`} key={index}>
                                    {part + ' '}
                                </a>
                            );
                        } else if (channelsRegex.test(part)) {
                            return (
                                <a
                                    className="post-channel-link"
                                    href={`/channel/${part.startsWith('#') ? part : part.slice(1)}`}
                                    key={index}
                                >
                                    {part + ' '}
                                </a>
                            );
                        } else {
                            return <span key={index}> {part} </span>;
                        }
                    })}
                </p>
            );
        }
    }, [message.content]);

    return (
        <Row className="g-4" as="article">
            <Col xs={2} className="pe-0 flex-row-reverse">
                <Image
                    className="w-100 float-end"
                    src={user?.profile_pic ?? '/anonymous-user.png'}
                    alt="profile image"
                    style={{ minWidth: '3rem', maxWidth: '5rem' }}
                    roundedCircle
                />
            </Col>
            <Col xs={10}>
                <Container className="d-flex justify-content-center flex-column pb-4">
                    <Row>
                        <div>
                            <a href={profiloUrl} className="text-decoration-none ">
                                <span className="fs-4 fw-bolder"> {user?.name}</span>
                            </a>
                            <a href={profiloUrl} className="text-decoration-none ">
                                <address className="fw-light post-address"> @{user?.username} </address>
                            </a>
                            {user?.role === UserRoles.VIP && <Icon.PatchCheckFill />}
                            <time dateTime={message.date.toString()}>
                                <span className="fw-light"> {toHumanReadableDate(message.date.toString())} </span>
                            </time>
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
                        <CategoryContext.Provider value={[null, setCategoryState]}>
                            <PostButtons messageId={message._id.toString()} reactions={message.reaction} />
                        </CategoryContext.Provider>
                    </Row>

                    <Row>
                        <Col>
                            {authState !== null && (
                                <Link to={`/addpost/${message._id.toString()}`} className="me-3">
                                    <span aria-label={toEnglishString(message.children.length) + ' replies'}>
                                        {' '}
                                        {message.children.length}
                                    </span>{' '}
                                    Reply
                                </Link>
                            )}
                        </Col>
                        <Col className="d-flex align-items-center">
                            <div title="total views">
                                <span aria-label={toEnglishString(message.views) + ' views'}>{message.views}</span>{' '}
                                <EyeIcon aria-hidden="true" />
                            </div>
                        </Col>
                    </Row>
                </Container>
            </Col>
        </Row>
    );
}

export default Post;
