import SidebarSearchLayout from 'src/layout/SidebarSearchLayout';
import PurchaseQuota from 'src/components/posts/PurchaseQuota';
import { Form, Button, Alert, Image, Collapse, ListGroup, ListGroupItem } from 'react-bootstrap';
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AuthContext } from 'src/contexts';
import { useNavigate } from 'react-router-dom';
import {
    type Maps,
    type IMessage,
    type MessageCreationRensponse,
    type MessageCreationMultipleChannels,
    mediaQuotaValue,
} from '@model/message';
import { useParams } from 'react-router';
import { fetchApi } from 'src/api/fetch';
import {
    apiMessageMultiple,
    apiMessageParent,
    apiTemporized,
    apiUser,
    getChannelSuggestions,
    getHashtabChannelSuggestions,
    getUserChannelSuggestions,
} from 'src/api/routes';
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
import { stringFormat, toEnglishString } from 'src/utils';
import { quotaMaxExtra } from '@model/quota';
import * as Icon from 'react-bootstrap-icons';
import 'src/scss/SideButton.scss';
import 'src/scss/Post.scss';
import { Lock as LockIcon } from 'react-bootstrap-icons';
import { type ISuggestion } from '@model/channel';

enum SearchType {
    Hashtag,
    User,
    Channel,
}

export default function AddPost(): JSX.Element {
    const [authState] = useContext(AuthContext);
    const navigate = useNavigate();
    const { parent } = useParams();

    const [payDebt, setPayDebt] = useState<boolean>(false);
    const [modalShow, setModalShow] = useState<boolean>(false);
    const [showWarning, setShowWarning] = useState<boolean>(false);
    const [oneTimeView, setOneTimeView] = useState<boolean>(false);

    const [destinations, setDestinations] = useState<string[]>([]);
    const [messageText, setMessageText] = useState<string>('');
    const [selectedImage, setSelectedImage] = useState<File | null>(null);

    const [geolocationCoord, setGeolocationCoord] = useState<Maps | null>(null);

    const [error, setError] = useState<string | null>(null);
    const [info, setInfo] = useState<string | null>(null);
    const [user, setUser] = useState<IUser | null>(null);

    const [selectedTempOption, setSelectedTempOption] = useState<TempSupportedContent>('text');
    const [tempPeriod, setTempPeriod] = useState<number>(1);
    const [tempTimes, setTempTimes] = useState<number>(1);

    const [showTemporize, setShowTemporize] = useState(false);

    const hiddenFileInput = useRef<HTMLInputElement | null>(null);

    const usedQuotaValue = useMemo(() => {
        const lenDest = destinations.length + (parent === undefined ? 0 : 1);
        if (geolocationCoord !== null || selectedImage !== null) {
            return mediaQuotaValue * lenDest;
        } else {
            return messageText.length * lenDest;
        }
    }, [geolocationCoord, selectedImage, messageText, destinations]);

    const remainingQuotaValue = useMemo(() => {
        if (user === null) return { day: 0, week: 0, month: 0 };
        return {
            day: user.maxQuota.day - user.usedQuota.day - usedQuotaValue,
            week: user.maxQuota.week - user.usedQuota.week - usedQuotaValue,
            month: user.maxQuota.month - user.usedQuota.month - usedQuotaValue,
        };
    }, [user, destinations, usedQuotaValue]);

    const extraQuotaValue = useMemo(() => {
        if (user === null) return 0;

        return getExtraQuota(user, usedQuotaValue);
    }, [user, usedQuotaValue, destinations]);

    const CloseButton = useCallback(() => {
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
    }, []);

    const ShowQuota = useCallback(() => {
        if (user === null) {
            return <></>;
        }
        return (
            <div className="mt-1">
                <span className="bg-primary rounded-pill me-1 px-2 mb-1 d-inline-block">
                    day: <span aria-label={toEnglishString(remainingQuotaValue.day)}> {remainingQuotaValue.day} </span>
                </span>
                <span className="bg-primary rounded-pill me-1 px-2 mb-1 d-inline-block">
                    week:{' '}
                    <span aria-label={toEnglishString(remainingQuotaValue.week)}> {remainingQuotaValue.week} </span>
                </span>
                <span className="bg-primary rounded-pill me-1 px-2 mb-1 d-inline-block">
                    month:{' '}
                    <span aria-label={toEnglishString(remainingQuotaValue.month)}> {remainingQuotaValue.month} </span>
                </span>
                <span className="bg-warning rounded-pill me-1 px-2 mb-1 d-inline-block">
                    extra: <span aria-label={toEnglishString(extraQuotaValue)}> {extraQuotaValue} </span>
                </span>
            </div>
        );
    }, [user, remainingQuotaValue, extraQuotaValue]);

    useEffect(() => {
        if (authState === null) {
            navigate('/login');
        }
    }, [authState, navigate]);

    const [displayParent, setDisplayParent] = useState<IMessage | null | string>(null);

    useEffect(() => {
        if (parent == null) return;
        fetchApi<IMessage>(
            stringFormat(apiMessageParent, [parent]),
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
            stringFormat(apiUser, [authState.username]),
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
            const remQuotaDay: number = remainingQuotaValue.day;
            const remQuotaWeek: number = remainingQuotaValue.week;
            const remQuotaMonth: number = remainingQuotaValue.month;
            if (remQuotaDay === 0 || remQuotaWeek === 0 || remQuotaMonth === 0) {
                return 0;
            }
            return Math.min(remQuotaDay, remQuotaWeek, remQuotaMonth) + quotaMaxExtra;
        }
        return 0;
    }, [remainingQuotaValue]);

    const sendTemporizedMessage = useCallback(
        (event?: React.FormEvent<HTMLButtonElement>) => {
            event?.preventDefault();
            const channel = destinations[0] as string;

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
                    setInfo(() => `Temporized Message Send Successfully check in channel ${channel}`);
                    // TODO: cambiare il feedback dei messaggi temporizzati in un secondo momento.
                },
                (error) => {
                    setError(() => error.message);
                },
            );
        },
        [destinations, selectedTempOption, tempPeriod, tempTimes, messageText, authState],
    );

    const sendMessage = useCallback(
        (event?: React.FormEvent<HTMLButtonElement>) => {
            event?.preventDefault();
            const channels = destinations;
            if (debt !== 0) {
                setPayDebt(true);
                return;
            } else if (user !== null && !haveEnoughtQuota(user, messageText.length)) {
                setError(() => 'Not enought quota');
                return;
            } else if (parent === undefined && channels.length === 0) {
                setError(() => 'Destinations not specified');
                return;
            }

            if (parent !== undefined) {
                if (!(displayParent instanceof Object)) {
                    setError(() => 'Parent not found');
                    return;
                }
            }

            const message: MessageCreationMultipleChannels = {
                channels,
                content: {
                    data: '',
                    type: 'text',
                },
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

            fetchApi<MessageCreationRensponse[]>(
                apiMessageMultiple,
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
                    navigate(`/message/${(message[0] as MessageCreationRensponse).id}`);
                },
                (error) => {
                    setError(() => error.message);
                },
            );
        },
        [messageText, destinations, parent, displayParent, selectedImage, authState, user, geolocationCoord],
    );

    const RenderParentMessage = useCallback((): JSX.Element => {
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

    const RenderFilePreview = useCallback((): JSX.Element => {
        // FIXME:, stranamente ogni volta che scrivo qualcosa, l'URL della src cambia, prova a
        // tenere l'ispector aperto quando scrivi qualcosa e vedi cosa succede.
        if (selectedImage == null) return <></>;

        return (
            <div className="d-flex flex-column align-items-center">
                Remaining Quota: {user !== null && <ShowQuota />}
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

    const setGeolocation = useCallback((): void => {
        navigator.geolocation.getCurrentPosition(function (position) {
            setGeolocationCoord({
                positions: [{ lat: position.coords.latitude, lng: position.coords.longitude }],
            });
        });
    }, [navigator.geolocation]);

    const RenderMessagePayload = useCallback(() => {
        if (selectedImage != null) {
            return <RenderFilePreview />;
        } else if (geolocationCoord != null) {
            return (
                <>
                    <div className="d-flex flex-column align-items-center">
                        Remaining Quota: {user !== null && <ShowQuota />}
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
                    <Form.Label>Remaining Quota: {user !== null && <ShowQuota />}</Form.Label>

                    <Form.Control
                        aria-label="message textarea"
                        as="textarea"
                        maxLength={maxLenghtChar}
                        rows={3}
                        onChange={(e) => {
                            setMessageText(() => e.target.value);
                        }}
                        value={messageText}
                        placeholder="Write your message here, you can also upload a file or send geolocation."
                    />
                </Form.Group>
            );
        }
    }, [selectedImage, geolocationCoord, user, maxLenghtChar, messageText]);

    const ChannelInput = useCallback(() => {
        const [currentChannel, setCurrentChannel] = useState<string>('');
        const [suggestions, setSuggestions] = useState<string[]>([]);
        const [activeSuggestionIdx, setActiveSuggestionIdx] = useState<number>(0);

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
            if (e.key === 'Enter' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.preventDefault();
            }

            if (suggestions.length > 0) {
                if (e.key === 'ArrowUp') {
                    setActiveSuggestionIdx((value) => Math.max(0, value - 1));
                } else if (e.key === 'ArrowDown') {
                    setActiveSuggestionIdx((value) => Math.min(suggestions.length - 1, value + 1));
                } else if (e.key === 'Enter' && activeSuggestionIdx >= 0 && activeSuggestionIdx < suggestions.length) {
                    chooseSuggestion(activeSuggestionIdx);
                }
                if (e.key === 'Enter' && e.ctrlKey) {
                    sendMessage();
                }
            }
        };

        const chooseSuggestion = (suggestionIdx: number): void => {
            setActiveSuggestionIdx(suggestionIdx);

            // con i temporized vorremmo al massimo un singolo canale.
            if (showTemporize) {
                setDestinations([suggestions[suggestionIdx] as string]);
            } else if (!destinations.includes(suggestions[suggestionIdx] as string)) {
                setDestinations((value) => [...value, suggestions[suggestionIdx] as string]);
            }
            setCurrentChannel('');
            setSuggestions([]);
        };

        useEffect(() => {
            if (currentChannel.length <= 0) return;

            let searchText = currentChannel;
            let searchType = SearchType.Channel;

            let suggestionUrl = getChannelSuggestions;
            if (searchText.startsWith('#')) {
                searchType = SearchType.Hashtag;
                suggestionUrl = getHashtabChannelSuggestions;
                searchText = searchText.substring(1);
            } else if (searchText.startsWith('@')) {
                searchType = SearchType.User;
                suggestionUrl = getUserChannelSuggestions;
                searchText = searchText.substring(1);
            }

            const searchParams = {
                search: searchText,
            };
            if (searchType === SearchType.Channel) {
                // @ts-expect-error local usage, should not warn
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
                searchParams.user = authState?.username;
            }

            const searchParamsString = new URLSearchParams(searchParams).toString();

            fetchApi<ISuggestion[]>(
                `${suggestionUrl}?${searchParamsString}`,
                { method: 'GET' },
                authState,
                (elements: ISuggestion[]) => {
                    setSuggestions([]);
                    if (searchText.length > 0 && searchType === SearchType.Hashtag) {
                        setSuggestions((value) => value.concat(addChannelPrefix(searchText, searchType)));
                    }
                    elements.forEach((element: ISuggestion) => {
                        setSuggestions((value) => value.concat(addChannelPrefix(element, searchType)));
                    });
                },
                (error: Error) => {
                    setSuggestions([]);
                    // le suggestions non sono una feature da dare l'errore all'utente, quindi meglio solamente
                    // un messaggio sulla console, serve solo per debug.
                    console.log(error.message ?? 'Error getting suggestions');
                },
            );
        }, [currentChannel]);

        function addChannelPrefix(channel: string, type: SearchType): string {
            switch (type) {
                case SearchType.Hashtag:
                    return '#' + channel;
                case SearchType.User:
                    return '@' + channel;
                case SearchType.Channel:
                    return channel;
                default:
                    return channel;
            }
        }

        return (
            <div className="position-relative">
                <Form.Group controlId="channelInput" className="group-add-post">
                    <Form.Label className="label-add-post">Channel</Form.Label>
                    <Form.Control
                        onKeyDown={handleKeyDown}
                        onChange={(e) => {
                            setCurrentChannel(e.target.value);
                        }}
                        value={currentChannel}
                        placeholder="Enter Channel name, @ for users, # for hashtags"
                        autoFocus={true}
                        autoComplete="off"
                    />
                </Form.Group>
                <div className="position-absolute w-50">
                    <ListGroup role="listbox">
                        {suggestions.map((suggestion, index) => {
                            return (
                                <ListGroupItem
                                    className="suggestion-list-item"
                                    role="option"
                                    key={index}
                                    active={index === activeSuggestionIdx}
                                    onClick={() => {
                                        chooseSuggestion(index);
                                    }}
                                    style={{ zIndex: 2 }}
                                    aria-label={'add channel ' + suggestion}
                                >
                                    {suggestion}
                                </ListGroupItem>
                            );
                        })}
                    </ListGroup>
                </div>
            </div>
        );
    }, [setDestinations, showTemporize]);

    const DisplayDestinations = useCallback(() => {
        return (
            <div className="d-flex flex-wrap">
                {destinations.map((destination, index) => {
                    return (
                        <div className="bg-primary rounded-pill me-1 px-2 mb-1" key={index}>
                            {destination}
                            <Icon.X
                                className="ms-1"
                                tabIndex={0}
                                role="button"
                                aria-label={'remove channel ' + destination}
                                onClick={() => {
                                    setDestinations((value) => value.filter((val) => val !== destination));
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        setDestinations((value) => value.filter((val) => val !== destination));
                                    }
                                }}
                            />
                        </div>
                    );
                })}
            </div>
        );
    }, [destinations]);

    return (
        <SidebarSearchLayout>
            <RenderParentMessage />
            <Form>
                {parent === undefined && (
                    <>
                        <ChannelInput />
                        <DisplayDestinations />
                    </>
                )}
                {RenderMessagePayload()}

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
                            {/* @ts-expect-error hidden should exist */}
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
                        onClick={() => {
                            setSelectedImage(null);
                            setGeolocation();
                        }}
                        onKeyUp={(e) => {
                            if (e.key === ' ' || e.key === 'Enter') {
                                e.preventDefault();
                                setSelectedImage(null);
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
                {error !== null && <Alert variant="danger">{error}</Alert>}

                <div className="d-flex flex-row justify-content-center mb-3">
                    <Form.Check // prettier-ignore
                        type="switch"
                        label="Temporize Message"
                        name="temporize message"
                        checked={showTemporize}
                        onChange={() => {
                            setShowTemporize(!showTemporize);
                            setDestinations((value) => value.splice(0, 1));
                            setSelectedImage(null);
                            setGeolocationCoord(null);
                        }}
                    />
                </div>

                <Collapse in={showTemporize}>
                    <div id="temporized-section">
                        <Alert>Note: You can set only one destination for temporized message</Alert>
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
            <>{info !== null && <Alert>{info}</Alert>}</>
        </SidebarSearchLayout>
    );
}
