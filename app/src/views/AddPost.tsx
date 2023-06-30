import SidebarSearchLayout from 'src/layout/SidebarSearchLayout';
import PurchaseQuota from 'src/components/posts/PurchaseQuota';
import { Form, Button, Alert, Image, Collapse } from 'react-bootstrap';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AuthContext } from 'src/contexts';
import { useNavigate } from 'react-router-dom';
import { type Maps, type MessageCreation, type IMessage, type MessageCreationRensponse } from '@model/message';
import { useParams } from 'react-router';
import { fetchApi } from 'src/api/fetch';
import { apiMessageBase, apiUserBase, apiTemporized } from 'src/api/routes';
import { type IUser, haveEnoughtQuota, getExtraQuota, UserRoles } from '@model/user';
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
import { quotaMaxExtra } from '@model/quota';
import * as Icon from 'react-bootstrap-icons';
import 'src/scss/SideButton.scss';
import { Lock as LockIcon } from 'react-bootstrap-icons';

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

    const [showTemporize, setShowTemporize] = useState(false);

    const hiddenFileInput = useRef<HTMLInputElement | null>(null);

    function CloseButton(): JSX.Element {
        return (
            <Button
                className="position-absolute rounded-circle top-0 end-0 p-1 m-1"
                variant="danger"
                style={{ zIndex: '1' }}
                onClick={() => {
                    setSelectedImage(null);
                    setGeolocationCoord(null);
                }}
            >
                <Icon.X role="button" aria-label="remove media" height={25} width={25} />
            </Button>
        );
    }

    function ShowQuota(props: { quota: number }): JSX.Element {
        if (user === null) {
            return <></>;
        }
        return (
            <div className="mt-1">
                <span className="bg-primary rounded-pill me-1 px-1 mb-1 d-inline-block">
                    day:{' '}
                    <span aria-label={toEnglishString(user.maxQuota.day - user.usedQuota.day - props.quota)}>
                        {' '}
                        {user.maxQuota.day - user.usedQuota.day - props.quota}{' '}
                    </span>
                </span>
                <span className="bg-primary rounded-pill me-1 px-1 mb-1 d-inline-block">
                    week:{' '}
                    <span aria-label={toEnglishString(user.maxQuota.week - user.usedQuota.week - props.quota)}>
                        {' '}
                        {user.maxQuota.week - user.usedQuota.week - props.quota}{' '}
                    </span>
                </span>
                <span className="bg-primary rounded-pill me-1 px-1 mb-1 d-inline-block">
                    month:{' '}
                    <span aria-label={toEnglishString(user.maxQuota.month - user.usedQuota.month - props.quota)}>
                        {' '}
                        {user.maxQuota.month - user.usedQuota.month - props.quota}{' '}
                    </span>
                </span>
                <span className="bg-warning rounded-pill me-1 px-1 mb-1 d-inline-block">
                    extra:{' '}
                    <span aria-label={toEnglishString(getExtraQuota(user, props.quota))}>
                        {' '}
                        {getExtraQuota(user, props.quota)}{' '}
                    </span>
                </span>
            </div>
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

    const role = useMemo<UserRoles | null>(() => {
        if (user === null) {
            return null;
        }
        return user.role;
    }, [user]);

    const permissions = useMemo<boolean>(() => {
        return role === UserRoles.SMM || role === UserRoles.VIP || role === UserRoles.VERIFIED;
    }, [user]);

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

    const maxLenghtChar = useMemo<number>(() => {
        if (user !== null) {
            const remQuotaDay: number = user.maxQuota.day - user.usedQuota.day;
            const remQuotaWeek: number = user.maxQuota.week - user.usedQuota.week;
            const remQuotaMonth: number = user.maxQuota.month - user.usedQuota.month;
            if (remQuotaDay === 0 || remQuotaWeek === 0 || remQuotaMonth === 0) {
                return 0;
            }
            return Math.min(remQuotaDay, remQuotaWeek, remQuotaMonth) + quotaMaxExtra;
        }
        return 0;
    }, [user?.maxQuota, user?.usedQuota]);

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
            } else if (parent === undefined && channel === '') {
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
                    setSelectedImage(null);
                    setGeolocationCoord(null);
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
            <div className="d-flex flex-column align-items-center">
                Remaining Quota: {user !== null && <ShowQuota quota={100} />}
                <div className="d-inline-flex flex-column position-relative">
                    {selectedImage.type.startsWith('image/') && (
                        <Image
                            className="mb-3 border"
                            alt="uploaded image"
                            src={URL.createObjectURL(selectedImage)}
                            fluid
                        />
                    )}

                    {selectedImage.type.startsWith('video/') && (
                        <>
                            <video className="mb-3 w-100" controls>
                                <source src={URL.createObjectURL(selectedImage)} type={selectedImage.type}></source>
                            </video>
                        </>
                    )}

                    <CloseButton />
                </div>
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
            return (
                <>
                    <div className="d-flex flex-column align-items-center">
                        Remaining Quota: {user !== null && <ShowQuota quota={100} />}
                    </div>
                    <div className="position-relative">
                        <Map positions={geolocationCoord.positions} />
                        <CloseButton />
                    </div>
                </>
            );
        } else {
            return (
                <Form.Group className="mb-3" controlId="textareaInput">
                    <Form.Label>
                        Remaining Quota: {user !== null && <ShowQuota quota={messageText.length} />}
                    </Form.Label>

                    <Form.Control
                        aria-label="message textarea"
                        as="textarea"
                        maxLength={maxLenghtChar}
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
                    <Form.Group controlId="channelInput" className="group-add-post">
                        <Form.Label className="label-add-post">Channel</Form.Label>
                        <Form.Control
                            onChange={(e) => {
                                setDestination(e.target.value);
                            }}
                            placeholder="Enter Channel name"
                            autoFocus={true}
                        />
                    </Form.Group>
                )}
                {/*  TODO: questa cosa dovrebbe essere molto pesante dal punto di vista dell'accessibilità, fixare */}
                {renderMessagePayload()}

                <div className="d-flex flex-row justify-content-center aling-items-center mb-3">
                    <Button
                        variant="warning"
                        onClick={() => {
                            setModalShow(true);
                        }}
                        disabled={!permissions}
                        className="d-flex align-items-center me-2"
                    >
                        <span className="d-flex align-items-center">
                            <LockIcon hidden={permissions} aria-hidden="true" size={19.2} className="me-1" />
                        </span>
                        Purchase Quota
                    </Button>

                    <Button className="me-2" type="submit" onClick={sendMessage} disabled={showTemporize}>
                        Send
                    </Button>

                    <Button
                        className="me-2 rounded-3 p-2"
                        variant="dark"
                        disabled={showTemporize}
                        aria-label="Input Media"
                        onClick={() => {
                            if (hiddenFileInput !== null) {
                                if (hiddenFileInput.current !== null) hiddenFileInput.current.click();
                            }
                        }}
                    >
                        <Form.Control
                            tabIndex={-1}
                            aria-hidden="true"
                            className="visually-hidden"
                            title="upload image"
                            type="file"
                            ref={hiddenFileInput}
                            disabled={showTemporize}
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
                        <Icon.Image aria-hidden="true" role="img" aria-label="upload media" height={25} width={25} />
                    </Button>

                    <Button
                        variant="dark"
                        disabled={showTemporize}
                        className="rounded-circle p-2"
                        aria-label="Geolocation"
                        onClick={setGeolocation}
                        onKeyUp={(e) => {
                            if (e.key === ' ' || e.key === 'Enter') {
                                e.preventDefault();
                                setGeolocation();
                            }
                        }}
                    >
                        <Icon.GeoAltFill aria-hidden="true" role="img" height={25} width={25} />
                    </Button>
                </div>

                <div hidden={permissions} style={{ color: 'var(--bs-yellow)' }} className="text-center mb-2">
                    The Purchase Quota service is reserved for verified or pro users.
                </div>

                <DebtWarning
                    show={showWarning}
                    onClose={() => {
                        setShowWarning(false);
                    }}
                />
                {/* TODO: show geolocation button */}

                {error !== null && <Alert variant="danger">{error}</Alert>}

                {/*  TODO: poi la parte qui sotto dovremmo spostarla in un altro tab o qualcosa del genere */}

                <div className="d-flex flex-row justify-content-center mb-3">
                    <Form.Check // prettier-ignore
                        type="switch"
                        label="Temporize Message"
                        name="temporize message"
                        checked={showTemporize}
                        onChange={() => {
                            setShowTemporize(!showTemporize);
                            setSelectedImage(null);
                            setGeolocationCoord(null);
                        }}
                    />
                </div>

                <Collapse in={showTemporize}>
                    <div id="temporized-section">
                        <Form.Group controlId="periodInput" className="group-add-post m-0">
                            <Form.Label className="label-add-post"> Period: </Form.Label>
                            <Form.Control
                                type="number"
                                aria-describedby="textPeriod"
                                min={0}
                                onChange={(e) => {
                                    let value = parseInt(e.target.value);
                                    if (isNaN(value)) {
                                        value = 0;
                                    }
                                    setTempPeriod(value);
                                }}
                            />
                        </Form.Group>
                        <Form.Text id="textPeriod" className="text-add-post">
                            Set the Interval between messages
                        </Form.Text>

                        <Form.Group controlId="timesInput" className="group-add-post m-0">
                            <Form.Label className="label-add-post"> Times: </Form.Label>
                            <Form.Control
                                type="number"
                                min={0}
                                aria-describedby="textTimes"
                                onChange={(e) => {
                                    let value = parseInt(e.target.value);
                                    if (isNaN(value)) {
                                        value = 0;
                                    }
                                    setTempTimes(value);
                                }}
                            />
                        </Form.Group>
                        <Form.Text id="textTimes" className="text-add-post">
                            Set the number of messages
                        </Form.Text>

                        <Form.Group className="d-flex flex-row px-1" controlId="typeTemporize">
                            <Form.Label> Type: </Form.Label>
                            <div className="d-flex flex-row justify-content-around w-100">
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

                        <div className="d-flex flex-row justify-content-center">
                            <Button className="my-2" type="submit" onClick={sendTemporizedMessage}>
                                Send Temporized
                            </Button>
                        </div>
                    </div>
                </Collapse>

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
