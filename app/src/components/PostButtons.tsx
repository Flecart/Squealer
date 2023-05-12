import { IReactionType, type IReaction } from '@model/message';
import { useState, useMemo, useContext, useCallback } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import { fetchApi } from '../api/fetch';
import { apiMessageBase } from '../api/routes';
import * as Icon from 'react-bootstrap-icons';
import { AuthContext } from 'src/contexts';
import 'src/scss/Post.scss';

interface IReactionButton {
    clicked: JSX.Element;
    nonclicked: JSX.Element;
    type: IReactionType;
    ariaAction: string;
    color: string;
}

const reactionsAndButtons = [
    {
        clicked: <Icon.HeartFill width={16} />,
        nonclicked: <Icon.Heart width={16} />,
        type: IReactionType.LOVE,
        ariaAction: 'Love Likes. Love',
        color: 'red',
    },
    {
        clicked: <Icon.HandThumbsUpFill width={16} />,
        nonclicked: <Icon.HandThumbsUp width={16} />,
        type: IReactionType.LIKE,
        ariaAction: 'Likes. Like',
        color: 'yellow',
    },
    {
        clicked: <Icon.HandThumbsDownFill width={16} />,
        nonclicked: <Icon.HandThumbsDown width={16} />,
        type: IReactionType.DISLIKE,
        ariaAction: 'Dislikes. Dislike',
        color: 'yellow',
    },
    {
        clicked: <Icon.HeartbreakFill width={16} />,
        nonclicked: <Icon.Heartbreak width={16} />,
        type: IReactionType.ANGRY,
        ariaAction: 'Angry Dislikes. Angry dislike',
        color: 'red',
    },
];

interface PostButtonProps {
    messageId: string;
    reactions: IReaction[];
}

export default function PostButtons({ messageId, reactions }: PostButtonProps): JSX.Element {
    const [authState] = useContext(AuthContext);

    const [currReaction, setReaction] = useState<IReactionType>(
        reactions.find((m: IReaction) => m.id === authState?.username)?.type ?? IReactionType.UNSET,
    );
    const [active, setActive] = useState<boolean>(authState !== null);

    const handleReaction = (type: IReactionType): void => {
        if (authState === null) return;
        setActive(false);
        setReaction(IReactionType.UNSET);
        fetchApi<IReactionType>(
            `${apiMessageBase}/${messageId}/reaction`,
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

    const buttonNumbers = useMemo(() => {
        // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
        const numbers: { [key: number]: number } = {};
        reactionsAndButtons.forEach((reactionButton) => {
            numbers[reactionButton.type] =
                reactions.filter((m) => m.type === reactionButton.type).length +
                (currReaction === reactionButton.type ? 1 : 0);
        });
        return numbers;
    }, [currReaction]);

    const accessibilityGroupLabel = useMemo(() => {
        let reactionLabel = '';
        reactionsAndButtons.forEach((reactionButton, i) => {
            const type = reactionButton.type;
            const number = buttonNumbers[type] as number;
            switch (type) {
                case IReactionType.LOVE:
                    reactionLabel += `${number} Hearth Likes`;
                    break;
                case IReactionType.LIKE:
                    reactionLabel += `${number} Likes`;
                    break;
                case IReactionType.DISLIKE:
                    reactionLabel += `${number} Dislikes`;
                    break;
                case IReactionType.ANGRY:
                    reactionLabel += `${number} Angry Dislikes`;
                    break;
            }

            if (i !== reactionsAndButtons.length - 1) {
                reactionLabel += ', ';
            }
        });
        return reactionLabel;
    }, [buttonNumbers]);

    const formatNumberReactions = useCallback((number: number): string => {
        if (number < 1000) {
            return number.toString();
        } else if (number < 1000000) {
            return `${(number / 1000).toFixed(1)}K`;
        } else {
            return `${(number / 1000000).toFixed(1)}M`;
        }
    }, []);

    return (
        <ButtonGroup aria-label={accessibilityGroupLabel} className="reaction-group">
            {reactionsAndButtons.map((currentReaction: IReactionButton) => {
                return (
                    <Button
                        key={currentReaction.type}
                        disabled={!active}
                        onClick={() => {
                            handleReaction(
                                currReaction === currentReaction.type ? IReactionType.UNSET : currentReaction.type,
                            );
                        }}
                        className="reaction-button"
                        area-label={`${buttonNumbers[currentReaction.type] as number} ${currentReaction.ariaAction}`}
                    >
                        <div
                            className={`reaction-content-${currReaction === currentReaction.type ? 'active-' : ''}${
                                currentReaction.color
                            }`}
                        >
                            <div className="icon-container">
                                <div className="reaction-background-effect"></div>
                                {currReaction === currentReaction.type
                                    ? currentReaction.clicked
                                    : currentReaction.nonclicked}
                            </div>
                            <span className="reaction-number">
                                {formatNumberReactions(buttonNumbers[currentReaction.type] as number)}
                            </span>
                        </div>
                    </Button>
                );
            })}
        </ButtonGroup>
    );
}
