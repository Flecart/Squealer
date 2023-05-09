import { IReactionType, type IMessage, type IReaction } from '@model/message';
import { type IUser } from '@model/user';
import { useContext, useEffect, useState } from 'react';
import { Button, Col, Container, Image, Row } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from 'src/contexts';
import { fetchApi } from '../api/fetch';
import { apiMessageBase, apiUserBase } from '../api/routes';
import { toHumanReadableDate } from 'src/utils';
import * as Icon from 'react-bootstrap-icons';

interface PostProps {
    message: IMessage;
}

interface IReactionButton {
    clicked: JSX.Element;
    nonclicked: JSX.Element;
    type: IReactionType;
}

const reactionsAndButtons = [
    {
        clicked: <Icon.HeartFill width={16} />,
        nonclicked: <Icon.Heart width={16} />,
        type: IReactionType.LOVE,
    },
    {
        clicked: <Icon.HandThumbsUpFill width={16} />,
        nonclicked: <Icon.HandThumbsUp width={16} />,
        type: IReactionType.LIKE,
    },
    {
        clicked: <Icon.HandThumbsDownFill width={16} />,
        nonclicked: <Icon.HandThumbsDown width={16} />,
        type: IReactionType.DISLIKE,
    },
    {
        clicked: <Icon.HeartbreakFill width={16} />,
        nonclicked: <Icon.Heartbreak width={16} />,
        type: IReactionType.ANGRY,
    },
];

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

    function ReactionComponent(): JSX.Element[] {
        let initReaction: IReactionType = IReactionType.UNSET;
        let reactions: IReaction[] = [];
        if (authState !== null) {
            const current = message.reaction.find((m: IReaction) => m.id === authState.username);
            initReaction = current?.type ?? IReactionType.UNSET;
            reactions = message.reaction.filter((m: IReaction) => m.id !== authState.username);
        } else {
            reactions = message.reaction;
        }
        const [reaction, setReaction] = useState<IReactionType>(initReaction);
        const [active, setActive] = useState<boolean>(authState !== null);

        const handleReaction = (type: IReactionType): void => {
            if (authState === null) return;
            setActive(false);
            setReaction(IReactionType.UNSET);
            fetchApi<IReactionType>(
                `${apiMessageBase}/${message._id.toString()}/reaction`,
                {
                    method: 'POST',
                    body: JSON.stringify({ type }),
                },
                authState,
                (reaction) => {
                    setReaction(reaction);
                    setActive(true);
                },
                (_) => {
                    setActive(true);
                },
            );
            setActive(true);
        };
        return reactionsAndButtons.map((currentReaction: IReactionButton) => {
            return (
                <Button
                    key={currentReaction.type}
                    disabled={!active}
                    onClick={() => {
                        handleReaction(reaction === currentReaction.type ? IReactionType.UNSET : currentReaction.type);
                    }}
                >
                    <span className="fw-light pe-2">
                        {reactions.filter((m) => m.type === currentReaction.type).length +
                            (reaction === currentReaction.type ? 1 : 0)}
                    </span>
                    {reaction === currentReaction.type ? currentReaction.clicked : currentReaction.nonclicked}
                </Button>
            );
        });
    }

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
                        <p>
                            {message.content.data}{' '}
                            {/* TODO: mostrare in modo differente a seconda del tipo, esempio imamgine o simile, questo sta ancora un altro compontent */}
                        </p>
                    </Row>
                    <Row>
                        {authState !== null && (
                            <Link to={`/addpost/${message._id.toString()}`} className="me-3">
                                Replay
                            </Link>
                        )}
                        {ReactionComponent()}
                    </Row>
                </Container>
            </Col>
        </Row>
    );
}

export default Post;
