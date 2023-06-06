import SidebarSearchLayout from 'src/layout/SidebarSearchLayout';
import PurchaseQuota from 'src/components/PurchaseQuota';
import { Form, Button, Alert, Row, Image, Container } from 'react-bootstrap';
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

    const [modalShow, setModalShow] = useState(false);

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

    const sendMessage = useCallback(
        (event: React.FormEvent<HTMLButtonElement>) => {
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
                    data: '',
                    type: 'text',
                },
                channel,
                parent,
            };

            const formData = new FormData();
            if (selectedImage != null) {
                formData.append('file', selectedImage);
                if (selectedImage.type.startsWith('image/')) message.content.type = 'image';
                else if (selectedImage.type.startsWith('video/')) message.content.type = 'video';
                else {
                    setError(() => 'File type not supported');
                    return;
                }
            } else {
                message.content.data = messageText;
            }
            formData.append('data', JSON.stringify(message));

            fetchApi<MessageCreationRensponse>(
                `${apiMessageBase}`,
                {
                    method: 'POST',
                    headers: {}, // so that the browser can set the content type automatically
                    body: formData,
                },
                authState,
                (message) => {
                    setError(() => null);
                    navigate(`/message/${message.id}`);
                },
                (error) => {
                    setError(() => error.message);
                },
            );
        },
        [messageText, destination, parent, displayParent, selectedImage, authState, user],
    );

    const renderParentMessage = useCallback((): JSX.Element => {
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

    const renderFilePreview = useCallback((): JSX.Element => {
        // FIXME:, stranamente ogni volta che scrivo qualcosa, l'URL della src cambia, prova a
        // tenere l'ispector aperto quando scrivi qualcosa e vedi cosa succede.

        // TODO: effetti sconosciuti quando provo a caricare un file e non un immagine.
        if (selectedImage == null) return <></>;

        return (
            <div>
                {user !== null &&
                    `day:${user.usedQuota.day + 100}/${user.maxQuota.day} week: ${user.usedQuota.week + 100}/${
                        user.maxQuota.week
                    } month:${user.usedQuota.month + 100}/${user.maxQuota.month}`}

                {selectedImage.type.startsWith('image/') && (
                    <Image className="mb-3" alt="uploaded image" src={URL.createObjectURL(selectedImage)} fluid />
                )}

                {selectedImage.type.startsWith('video/') && (
                    <Container>
                        <video className="mb-3 w-100" controls>
                            <source src={URL.createObjectURL(selectedImage)} type={selectedImage.type}></source>
                        </video>
                    </Container>
                )}

                <Button
                    onClick={() => {
                        setSelectedImage(null);
                    }}
                >
                    Remove
                </Button>
            </div>
        );
    }, [user, selectedImage]);

    return (
        <SidebarSearchLayout>
            {renderParentMessage()}
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
                {/*  TODO: questa cosa dovrebbe essere molto pesante dal punto di vista dell'accessibilità, fixare */}
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
                    renderFilePreview()
                )}

                <Form.Group>
                    <Form.Label>File to upload: </Form.Label>
                    <Form.Control
                        title="upload image"
                        type="file"
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            console.log('got change');
                            if (event.target.files === null || event.target.files.length < 1) return;
                            const file: File = event.target.files[0] as File;
                            if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
                                setError(() => 'You can only upload images or videos');
                                return;
                            }

                            console.log('type is ', file.type);
                            setSelectedImage(event.target.files[0] as File);
                        }}
                    />
                </Form.Group>

                <Button className="my-2" type="submit" onClick={sendMessage}>
                    Send
                </Button>
                {error !== null && (
                    <Row>
                        <Alert variant="danger">{error}</Alert>
                    </Row>
                )}
                <Button
                    variant="warning"
                    onClick={() => {
                        setModalShow(true);
                    }}
                >
                    Acquista Quota
                </Button>

                <PurchaseQuota
                    show={modalShow}
                    onHide={() => {
                        setModalShow(false);
                        navigate(0);
                    }}
                />
            </Form>
        </SidebarSearchLayout>
    );
}
