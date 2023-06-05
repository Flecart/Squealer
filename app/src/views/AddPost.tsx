import SidebarSearchLayout from 'src/layout/SidebarSearchLayout';
import { Form, Button, Alert, Row, Image, Container } from 'react-bootstrap';
import { useCallback, useContext, useEffect, useState } from 'react';
import { AuthContext } from 'src/contexts';
import { useNavigate } from 'react-router-dom';
import { type Maps, type MessageCreation, type IMessage, type MessageCreationRensponse } from '@model/message';
import { useParams } from 'react-router';
import { fetchApi } from 'src/api/fetch';
import { apiMessageBase, apiUserBase } from 'src/api/routes';
import Post from 'src/components/Post';
import { type IUser, haveEnoughtQuota } from '@model/user';
import Map from 'src/components/Map';
import { v4 as uuidv4 } from 'uuid';

export default function AddPost(): JSX.Element {
    const [authState] = useContext(AuthContext);
    const navigate = useNavigate();
    const { parent } = useParams();

    const [messageText, setMessageText] = useState<string>('');
    const [destination, setDestination] = useState<string>('');
    const [selectedImage, setSelectedImage] = useState<File | null>(null);

    const [geolocationCoord, setGeolocationCoord] = useState<Maps | null>(null);

    const [error, setError] = useState<string | null>(null);

    const [user, setUser] = useState<IUser | null>(null);

    useEffect(() => {
        if (authState === null) {
            navigate('/login');
        }
    }, [authState, navigate]);

    const [displayParent, setDisplayParent] = useState<IMessage | null | string>(null);

    useEffect(() => {
        if (parent == null) return;
        fetchApi<IMessage>(
            `${apiMessageBase}/${parent}/`,
            { method: 'GET' },
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
            { method: 'GET' },
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
        (event?: React.FormEvent<HTMLButtonElement>) => {
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
            } else if (geolocationCoord != null) {
                message.content.data = geolocationCoord;
                message.content.type = 'maps';
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
        [messageText, destination, parent, displayParent, selectedImage, authState, user, geolocationCoord],
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

    const setGeolocation = (): void => {
        console.log('geoclicked');
        navigator.geolocation.getCurrentPosition(function (position) {
            console.log('setting geolocation');
            setGeolocationCoord({
                positions: [{ lat: position.coords.latitude, lng: position.coords.longitude }],
            });
        });
    };

    const renderMessagePayload = useCallback(() => {
        if (selectedImage != null) {
            return renderFilePreview();
        } else if (geolocationCoord != null) {
            // TODO: fix me
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            return <Map positions={geolocationCoord.positions} />;
        } else {
            return (
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
            );
        }
    }, [user, geolocationCoord, selectedImage]);
    const sendRandomImage = async (): void => {
        await fetch('https://picsum.photos/1000')
            .then(async (response) => {
                return await response.arrayBuffer();
            })
            .then((buffer) => {
                // eslint-disable-next-line
                setSelectedImage(new File([buffer], uuidv4() as string, { type: 'image/jpeg' }));
            })
            .catch((_) => {
                setError(() => "Couldn't fetch random image");
            });

        sendMessage();
    };

    const sendRandomText = (): void => {
        console.log('sending random text');
    };

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
                {renderMessagePayload()}

                <Form.Group>
                    <Form.Label>File to upload: </Form.Label>
                    <Form.Control
                        title="upload image"
                        type="file"
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            if (event.target.files === null || event.target.files.length < 1) return;
                            const file: File = event.target.files[0] as File;
                            if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
                                setError(() => 'You can only upload images or videos');
                                return;
                            }

                            setSelectedImage(event.target.files[0] as File);
                        }}
                    />
                </Form.Group>
                {/* TODO: show geolocation button */}

                <Button className="my-2" onClick={setGeolocation}>
                    Geolocation
                </Button>

                <Container className="py-2 px-0">
                    <Button className="me-2" onClick={sendRandomImage} value="send random image">
                        Send random image
                    </Button>
                    <Button onClick={sendRandomText} value="send random text">
                        Send random text
                    </Button>
                </Container>

                <Button className="my-2" type="submit" onClick={sendMessage}>
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
