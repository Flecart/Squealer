import SidebarSearchLayout from 'src/layout/SidebarSearchLayout';
import { Form, Button, Alert, Row, Image } from 'react-bootstrap';
import { useCallback, useContext, useEffect, useState } from 'react';
import { AuthContext } from 'src/contexts';
import { useNavigate } from 'react-router-dom';
import { type MessageCreation, type IMessage, type MessageCreationRensponse } from '@model/message';
import { useParams } from 'react-router';
import { fetchApi } from 'src/api/fetch';
import { apiMessageBase, apiUserBase } from 'src/api/routes';
import Post from 'src/components/Post';
import { type IUser, haveEnoughtQuota } from '@model/user';

export default function AddPost(): JSX.Element {
    const [authState] = useContext(AuthContext);
    const navigate = useNavigate();
    const { parent } = useParams();

    const [messageText, setMessageText] = useState<string>('');
    const [destination, setDestination] = useState<string>('');
    const [selectedImage, setSelectedImage] = useState<File | null>(null);

    const [error, setError] = useState<string | null>(null);

    const [user, setUser] = useState<IUser | null>(null);

    if (authState === null) {
        navigate('/login');
    }

    const [displayParent, setDisplayParent] = useState<IMessage | null | string>(null);

    useEffect(() => {
        if (parent == null) return;
        fetchApi<IMessage>(
            `${apiMessageBase}/${parent}/`,
            {
                method: 'GET',
            },
            authState,
            (messaggio) => {
                setDisplayParent(() => messaggio);
            },
            (error) => {
                // TODO: gestire il caso in cui il parent non ci sia
                setDisplayParent(() => error.message);
            },
        );
    }, [parent]);

    useEffect(() => {
        if (authState === null) return;
        fetchApi<IUser>(
            `${apiUserBase}/${authState.username}/`,
            {
                method: 'GET',
            },
            authState,
            (user) => {
                setUser(() => user);
            },
            (error) => {
                setDisplayParent(() => error.message);
            },
        );
    }, [authState?.username]);

    function sendMessage(event: React.FormEvent<HTMLButtonElement>): void {
        event?.preventDefault();
        if (user !== null && !haveEnoughtQuota(user, messageText.length)) {
            setError(() => 'Not enought quota');
            return;
        }

        let channel = destination;
        if (parent !== undefined) {
            if (displayParent instanceof Object) channel = displayParent.channel;
            else {
                setError(() => 'Parent not found');
                return;
            }
        }
        const message: MessageCreation = {
            content: {
                data: messageText,
                type: 'text',
            },
            channel,
            parent,
        };
        fetchApi<MessageCreationRensponse>(
            `${apiMessageBase}/`,
            {
                method: 'POST',
                body: JSON.stringify(message),
            },
            authState,
            (message) => {
                navigate(`/message/${message.id}`);
            },
            (error) => {
                setError(() => error.message);
            },
        );
    }

    const displayParentMessage = useCallback((): JSX.Element => {
        if (parent === undefined) return <> </>;
        if (displayParent == null) {
            return <> Loading Message </>;
        } else if (displayParent instanceof String) {
            return <Alert variant="danger">{displayParent}</Alert>;
        } else if (displayParent instanceof Object) {
            return <Post message={displayParent}></Post>;
        } else {
            return <> </>;
        }
    }, [parent, displayParent]);

    return (
        <SidebarSearchLayout>
            {displayParentMessage()}
            <Form>
                {parent === undefined && (
                    <Form.Group className="mb-3">
                        <Form.Label>Channel</Form.Label>
                        <Form.Control
                            onChange={(e) => {
                                setDestination(e.target.value);
                            }}
                        />
                    </Form.Group>
                )}
                {selectedImage == null ? (
                    <Form.Group className="mb-3">
                        <Form.Label>
                            Message textarea{' '}
                            {user !== null &&
                                `day:${user.usedQuota.day + messageText.length}/${user.maxQuota.day} week: ${
                                    user.usedQuota.week + messageText.length
                                }/${user.maxQuota.week} month:${user.usedQuota.month + messageText.length}/${
                                    user.maxQuota.month
                                }`}
                        </Form.Label>

                        <Form.Control
                            as="textarea"
                            rows={3}
                            onChange={(e) => {
                                setMessageText(e.target.value);
                            }}
                        />
                    </Form.Group>
                ) : (
                    <div>
                        {user !== null &&
                            `day:${user.usedQuota.day + 100}/${user.maxQuota.day} week: ${user.usedQuota.week + 100}/${
                                user.maxQuota.week
                            } month:${user.usedQuota.month + 100}/${user.maxQuota.month}`}
                        <Image
                            className="mb-3"
                            alt="uploaded image"
                            src={URL.createObjectURL(selectedImage)}
                            thumbnail
                        />
                        <Button
                            onClick={() => {
                                setSelectedImage(null);
                            }}
                        >
                            Remove
                        </Button>
                    </div>
                )}

                <Form.Group>
                    <Form.Label>Image: </Form.Label>
                    <Form.Control
                        title="upload image"
                        type="file"
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            console.log(event);
                            if (event.target.files === null || event.target.files.length < 1) return;
                            setSelectedImage(event.target.files[0] as File);
                        }}
                    />
                </Form.Group>

                <Button className="mt-2" type="submit" onClick={sendMessage}>
                    Send
                </Button>
                {error !== null && (
                    <Row>
                        <Alert variant="danger">{error}</Alert>
                    </Row>
                )}
            </Form>
        </SidebarSearchLayout>
    );
}
