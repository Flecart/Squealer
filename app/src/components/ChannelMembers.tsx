import { PermissionType, type IChannel } from '@model/channel';
import { fetchApi } from 'src/api/fetch';
import { apiChannelAddOwner, apiChannelDelete, apiChannelSetPermission, apiUser } from 'src/api/routes';
import { useContext, useEffect, useState } from 'react';
import { Alert, Button, Card, Form, Image, Stack } from 'react-bootstrap';
import * as Icon from 'react-bootstrap-icons';
import { AuthContext } from 'src/contexts';
import { type ISuccessMessage, type IUser } from '@model/user';
import { stringFormat } from 'src/utils';
import { useNavigate } from 'react-router-dom';

interface PrompsChannelMembers {
    channel: IChannel;
}

interface ChannelUser {
    user: string;
    privilege: PermissionType;
    notification: boolean;
}

export default function ChannelMembers({ channel }: PrompsChannelMembers): JSX.Element {
    const [auth] = useContext(AuthContext);
    const permission = channel.users.find((user) => user.user === auth?.username)?.privilege;

    const [user, setUser] = useState<string>('');
    const [error, setError] = useState<null | string>(null);
    const [pending, setPending] = useState(false);
    const [info, setInfo] = useState<null | string>(null);

    const navigator = useNavigate();

    const handleDelete = (): void => {
        fetchApi<ISuccessMessage>(
            stringFormat(apiChannelDelete, [channel.name]),
            {
                method: 'DELETE',
            },
            auth,
            (_) => {
                navigator('/');
            },
            (e) => {
                setError(e.message);
            },
        );
    };

    const sendInvite = (): void => {
        setPending(true);
        setError(null);
        setInfo(null);
        fetchApi<ISuccessMessage>(
            stringFormat(apiChannelAddOwner, [channel.name]),
            {
                method: 'POST',
                body: JSON.stringify({
                    toUser: user,
                    permission: PermissionType.READWRITE,
                }),
            },
            auth,
            (a) => {
                setInfo(`request sent to ${a.message}`);
                setPending(false);
            },
            (e) => {
                setError(e.message);
                setPending(false);
            },
        );
    };

    const isAdmin = permission !== undefined && permission === PermissionType.ADMIN;
    return (
        <>
            {isAdmin && (
                <Card body>
                    <Form.Group controlId="userAdd" className="d-flex flex-column align-items-center">
                        <Form.Label>Invite an user</Form.Label>
                        <Form.Control
                            type="text"
                            disabled={pending}
                            onChange={(e) => {
                                setUser(e.target.value);
                            }}
                            placeholder="Insert username here"
                            className="mb-2"
                        />

                        <Button
                            onClick={() => {
                                sendInvite();
                            }}
                            className="d-flex flex-row align-items-center"
                        >
                            Invite
                            <Icon.PersonAdd aria-hidden={true} size={19.2} className="w-50 ms-1" />
                        </Button>

                    </Form.Group>
                    {info !== null && <Alert variant="info">{info}</Alert>}
                    {error !== null && <Alert variant="danger">{error}</Alert>}
                </Card>
            )}
            <Stack>
                <div className="d-flex flex-row justify-content-between mt-2">
                    <span className="ms-5">username</span>
                    <label id="label-set-role" className="me-5">
                        {isAdmin ? 'set' : ''} members role
                    </label>
                </div>
                {channel.users.map((member) => (
                    <ChannelMember key={member.user} member={member} admin={isAdmin} channel={channel.name} />
                ))}
            </Stack>
            {isAdmin && (
                <div>
                    <Alert variant="dark" className="mt-4">
                        <p>
                            <br />
                            <strong>DANGER: this action is inreversable</strong>
                        </p>

                        <Button variant="danger" onClick={handleDelete}>
                            Delete Channel
                        </Button>
                    </Alert>
                </div>
            )}
        </>
    );
}

function ChannelMember({
    member,
    admin,
    channel,
}: {
    member: ChannelUser;
    admin: boolean;
    channel: string;
}): JSX.Element {
    const [user, setUser] = useState<IUser | null>(null);
    const [auth] = useContext(AuthContext);

    useEffect(() => {
        fetchApi<IUser>(
            stringFormat(apiUser, [member.user]),
            { method: 'GET' },
            null,
            (user) => {
                setUser(() => user);
            },
            (_) => {},
        );
    }, [member.user]);

    function PrivilegeIcon({ privilege }: { privilege: PermissionType }): JSX.Element {
        if (!admin)
            return (
                <span className="d-flex flex-row align-items-center">
                    {privilege} <PrivilegeToIcon privilage={privilege} />
                </span>
            );

        const [priv, setPriv] = useState(privilege);
        const [pending, setPending] = useState(false);
        const onClick = (): void => {
            setPending(true);
            fetchApi<PermissionType>(
                stringFormat(apiChannelSetPermission, [channel]),
                {
                    method: 'POST',
                    body: JSON.stringify({
                        permission: priv,
                        toUser: member.user,
                    }),
                },
                auth,
                (priv) => {
                    setPriv(priv);
                    setPending(false);
                },
                (e) => {
                    console.log(e);
                    document.getElementById(`${member.user}-privilege`)?.setAttribute('value', privilege);
                    setPending(false);
                },
            );
        };

        return (
            <>
                <Form.Select
                    id={`${member.user}-privilege`}
                    defaultValue={privilege}
                    onChange={(e) => {
                        setPriv(e.target.value as PermissionType);
                    }}
                    disabled={pending}
                    className="text-center w-50"
                    aria-aria-labelledby="label-set-role"
                >
                    {Object.values(PermissionType).map((value: PermissionType) => (
                        <option key={value} value={value}>
                            {value}
                        </option>
                    ))}
                </Form.Select>
                <Button onClick={onClick} disabled={pending}>
                    Update
                </Button>
            </>
        );
    }

    // TODO:aggiungere la possibilità di modificare i permessi degli altri

    return (
        <>
            <Stack style={{ minHeight: '4rem', maxHeight: '6rem' }} gap={3} direction="horizontal">
                {user !== null && (
                    <Image
                        className="w-100 float-end"
                        src={user.profile_pic}
                        alt="profile image"
                        style={{ minWidth: '2rem', maxWidth: '2rem' }}
                        roundedCircle
                    />
                )}
                <span>{member.user}</span>
                <div className="ms-auto">
                    <Stack gap={1} direction="horizontal">
                        {member.notification ? (
                            <Icon.Bell className="me-1" width={16} height={16} aria-label="enabled notification" />
                        ) : (
                            <Icon.BellSlash
                                className="me-1"
                                width={16}
                                height={16}
                                aria-label="disabled notification"
                            />
                        )}
                        <PrivilegeIcon privilege={member.privilege} />
                    </Stack>
                </div>
            </Stack>
            <hr style={{ margin: 0 }} />
        </>
    );
}

function PrivilegeToIcon({ privilage }: { privilage: PermissionType }): JSX.Element {
    switch (privilage) {
        case PermissionType.READ:
            return <Icon.Eyeglasses className="ms-1" width={20} height={20} aria-hidden={true} />;
        case PermissionType.READWRITE:
            return <Icon.Pencil className="ms-1" width={20} height={20} aria-hidden={true} />;
        case PermissionType.ADMIN:
            return <Icon.PersonCheck className="ms-1" width={20} height={20} aria-hidden={true} />;
    }
    return <></>;
}
