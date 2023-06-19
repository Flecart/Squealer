import SidebarSearchLayout from 'src/layout/SidebarSearchLayout';
import PurchaseQuota from 'src/components/PurchaseQuota';
import { Form, Button, Alert, Row, Image, Container } from 'react-bootstrap';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from 'src/contexts';
import { useNavigate } from 'react-router-dom';
import { type Maps, type MessageCreation, type IMessage, type MessageCreationRensponse } from '@model/message';
import { useParams } from 'react-router';
import { fetchApi } from 'src/api/fetch';
import { apiMessageBase, apiUserBase, apiTemporized } from 'src/api/routes';
import Post from 'src/components/Post';
import { type IUser, haveEnoughtQuota, UserRoles } from '@model/user';
import { Lock } from 'react-bootstrap-icons';
import {
    type ITemporizzati,
    type ContentInput as TemporizedContentInput,
    type TempSupportedContent,
} from '@model/temporizzati';
import Map from 'src/components/Map';

export default function AddPost(): JSX.Element {
    const [authState] = useContext(AuthContext);
    const navigate = useNavigate();
    const { parent } = useParams();

    const [modalShow, setModalShow] = useState<boolean>(false);

    const [messageText, setMessageText] = useState<string>('');
    const [destination, setDestination] = useState<string>('');
    const [selectedImage, setSelectedImage] = useState<File | null>(null);

    const [geolocationCoord, setGeolocationCoord] = useState<Maps | null>(null);

    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<IUser | null>(null);

    const [selectedTempOption, setSelectedTempOption] = useState<TempSupportedContent>('text');
    const [tempPeriod, setTempPeriod] = useState<number>(1);
    const [tempTimes, setTempTimes] = useState<number>(1);

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

    const role = useMemo<UserRoles | null>(() => {
        if (user === null) {
            return null;
        }
        return user.role;
    }, [user]);

    const permissions = useMemo<boolean>(() => {
        return role === UserRoles.SMM || role === UserRoles.VIP;
    }, [user]);

    const sendTemporizedMessage = useCallback(
        (event?: React.FormEvent<HTMLButtonElement>) => {
            event?.preventDefault();
            const channel = destination;

            const temporizedContent: TemporizedContentInput = {
                channel,
                content: {
                    type: selectedTempOption,
                    data: '',
                },
                periodo: tempPeriod,
                iterazioni: tempTimes,
            };

            if (selectedTempOption === 'text') temporizedContent.content.data = messageText;

            fetchApi<ITemporizzati>(
                apiTemporized,
                {
                    method: 'POST',
                    body: JSON.stringify(temporizedContent),
                },
                authState,
                (temporized) => {
                    setError(() => null);
                    console.log(temporized);
                    // TODO: cambiare il feedback dei messaggi temporizzati in un secondo momento.
                },
                (error) => {
                    setError(() => error.message);
                },
            );
        },
        [destination, selectedTempOption, tempPeriod, tempTimes, messageText, authState],
    );

    const sendMessage = useCallback(
        (event?: React.FormEvent<HTMLButtonElement>) => {
            event?.preventDefault();
            let channel = destination;
            if (user !== null && !haveEnoughtQuota(user, messageText.length)) {
                setError(() => 'Not enought quota');
                return;
            } else if (channel === '') {
                setError(() => 'Destination not specified');
                return;
            }

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

                <div className="d-flex flex-row no-wrap">
                    <Button className="my-2" onClick={setGeolocation}>
                        Geolocation
                    </Button>

                    <Button className="my-2" type="submit" onClick={sendMessage}>
                        Send
                    </Button>

                    <Button
                        variant="warning"
                        onClick={() => {
                            setModalShow(true);
                        }}
                        disabled={!permissions}
                        className="d-flex align-items-center my-2"
                    >
                        <span hidden={permissions}>
                            <Lock size={19.2} className="pe-1" />
                        </span>
                        Acquista Quota
                    </Button>
                </div>
                <span hidden={permissions} style={{ color: 'var(--bs-yellow)' }} className="mb-2">
                    L&apos;Acquisto Quota è riservato agli utenti verificati o pro
                </span>

                {/*  TODO: poi la parte qui sotto dovremmo spostarla in un altro tab o qualcosa del genere */}

                <Form.Group className="mb-3">
                    <Form.Label> Period: </Form.Label>
                    <Form.Control
                        type="number"
                        onChange={(e) => {
                            let value = parseInt(e.target.value);
                            if (isNaN(value)) {
                                value = 0;
                            }
                            setTempPeriod(value);
                        }}
                    />

                    <Form.Label> Times: </Form.Label>
                    <Form.Control
                        type="number"
                        onChange={(e) => {
                            let value = parseInt(e.target.value);
                            if (isNaN(value)) {
                                value = 0;
                            }
                            setTempTimes(value);
                        }}
                    />

                    <Form.Label> Type: </Form.Label>

                    <div>
                        <Form.Check
                            type="radio"
                            label="Wikipedia"
                            name="option"
                            value="wikipedia"
                            checked={selectedTempOption === 'wikipedia'}
                            onChange={(e) => {
                                setSelectedTempOption(e.target.value as TempSupportedContent);
                            }}
                        />
                        <Form.Check
                            type="radio"
                            label="Image"
                            name="option"
                            value="image"
                            checked={selectedTempOption === 'image'}
                            onChange={(e) => {
                                setSelectedTempOption(e.target.value as TempSupportedContent);
                            }}
                        />
                        <Form.Check
                            type="radio"
                            label="Text"
                            name="option"
                            value="text"
                            checked={selectedTempOption === 'text'}
                            onChange={(e) => {
                                setSelectedTempOption(e.target.value as TempSupportedContent);
                            }}
                        />
                    </div>
                </Form.Group>

                <Button className="my-2" type="submit" onClick={sendTemporizedMessage}>
                    Send Temporizzato
                </Button>
                {error !== null && (
                    <Row>
                        <Alert variant="danger">{error}</Alert>
                    </Row>
                )}

                <PurchaseQuota
                    show={modalShow}
                    onHide={() => {
                        setModalShow(false);
                    }}
                />
            </Form>
        </SidebarSearchLayout>
    );
}
