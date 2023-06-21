import SidebarSearchLayout from 'src/layout/SidebarSearchLayout';
import PurchaseQuota from 'src/components/posts/PurchaseQuota';
import { Form, Button, Alert, Row, Image, Container } from 'react-bootstrap';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from 'src/contexts';
import { useNavigate } from 'react-router-dom';
import { type Maps, type MessageCreation, type IMessage, type MessageCreationRensponse } from '@model/message';
import { useParams } from 'react-router';
import { fetchApi } from 'src/api/fetch';
import { apiMessageBase, apiUserBase, apiTemporized } from 'src/api/routes';
import { type IUser, haveEnoughtQuota, getExtraQuota } from '@model/user';
import Post from 'src/components/posts/Post';
import {
    type ITemporizzati,
    type ContentInput as TemporizedContentInput,
    type TempSupportedContent,
} from '@model/temporizzati';
import Map from 'src/components/Map';
import PayDebt from 'src/components/PayDebt';
import DebtWarning from 'src/components/DebtWarning';
import { toEnglishString } from 'src/utils';

export default function AddPost(): JSX.Element {
    const [authState] = useContext(AuthContext);
    const navigate = useNavigate();
    const { parent } = useParams();

    const [payDebt, setPayDebt] = useState<boolean>(false);
    const [modalShow, setModalShow] = useState<boolean>(false);
    const [showWarning, setShowWarning] = useState<boolean>(false);
    const [oneTimeView, setOneTimeView] = useState<boolean>(false);

    const [messageText, setMessageText] = useState<string>('');
    const [destination, setDestination] = useState<string>('');
    const [selectedImage, setSelectedImage] = useState<File | null>(null);

    const [geolocationCoord, setGeolocationCoord] = useState<Maps | null>(null);

    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<IUser | null>(null);

    const [selectedTempOption, setSelectedTempOption] = useState<TempSupportedContent>('text');
    const [tempPeriod, setTempPeriod] = useState<number>(1);
    const [tempTimes, setTempTimes] = useState<number>(1);

    function ShowQuota(props: { quota: number }): JSX.Element {
        if (user === null) {
            return <></>;
        }
        return (
            <>
                day:{' '}
                <span aria-label={toEnglishString(user.maxQuota.day - user.usedQuota.day - props.quota)}>
                    {' '}
                    {user.maxQuota.day - user.usedQuota.day - props.quota}{' '}
                </span>
                week:{' '}
                <span aria-label={toEnglishString(user.maxQuota.week - user.usedQuota.week - props.quota)}>
                    {' '}
                    {user.maxQuota.week - user.usedQuota.week - props.quota}{' '}
                </span>
                month:{' '}
                <span aria-label={toEnglishString(user.maxQuota.month - user.usedQuota.month - props.quota)}>
                    {' '}
                    {user.maxQuota.month - user.usedQuota.month - props.quota}{' '}
                </span>
                extra:{' '}
                <span aria-label={toEnglishString(getExtraQuota(user, props.quota))}>
                    {' '}
                    {getExtraQuota(user, props.quota)}{' '}
                </span>
            </>
        );
    }

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

    useEffect(() => {
        if (user !== null && !oneTimeView) {
            if (selectedImage === null && getExtraQuota(user, messageText.length) < 50) {
                setOneTimeView(true);
                setShowWarning(true);
            } else if (selectedImage !== null && getExtraQuota(user, 100) < 50) {
                setOneTimeView(true);
                setShowWarning(true);
            }
        }
    }, [user, selectedImage, messageText]);

    const debt = useMemo<number>(() => {
        if (user !== null) {
            return user.debtQuota;
        }
        return 0;
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
            if (debt !== 0) {
                setPayDebt(true);
                return;
            } else if (user !== null && !haveEnoughtQuota(user, messageText.length)) {
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
                {user !== null && <ShowQuota quota={100} />}

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
            return <Map positions={geolocationCoord.positions} />;
        } else {
            return (
                <Form.Group className="mb-3" controlId="textareaInput">
                    <Form.Label>
                        Message textarea, remaining quota: {user !== null && <ShowQuota quota={messageText.length} />}
                    </Form.Label>

                    <Form.Control
                        as="textarea"
                        rows={3}
                        onChange={(e) => {
                            setMessageText(e.target.value);
                        }}
                        placeholder="Write your message here, you can also upload a file or send geolocation."
                    />
                </Form.Group>
            );
        }
    }, [user, messageText, geolocationCoord, selectedImage]);

    return (
        <SidebarSearchLayout>
            {renderParentMessage()}
            <Form>
                {parent === undefined && (
                    <Form.Group className="mb-3" controlId="channelInput">
                        <Form.Label>Channel</Form.Label>
                        <Form.Control
                            onChange={(e) => {
                                setDestination(e.target.value);
                            }}
                            placeholder="Enter Channel Name"
                            autoFocus={true}
                        />
                    </Form.Group>
                )}
                {/*  TODO: questa cosa dovrebbe essere molto pesante dal punto di vista dell'accessibilità, fixare */}
                {renderMessagePayload()}

                <Form.Group controlId="fileUploadInput">
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
                <DebtWarning
                    show={showWarning}
                    onClose={() => {
                        setShowWarning(false);
                    }}
                />
                {/* TODO: show geolocation button */}

                <Button className="my-2" onClick={setGeolocation}>
                    Geolocation
                </Button>

                <Button className="my-2" type="submit" onClick={sendMessage}>
                    Send
                </Button>

                {error !== null && (
                    <Row>
                        <Alert variant="danger">{error}</Alert>
                    </Row>
                )}

                {/*  TODO: poi la parte qui sotto dovremmo spostarla in un altro tab o qualcosa del genere */}

                <Form.Group className="mb-3" controlId="periodInput">
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
                    }}
                />

                <PayDebt
                    show={payDebt}
                    onHide={() => {
                        setPayDebt(false);
                    }}
                    debt={debt}
                />
            </Form>
        </SidebarSearchLayout>
    );
}
