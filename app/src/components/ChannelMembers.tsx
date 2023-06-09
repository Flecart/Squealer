import { PermissionType, type IChannel } from '@model/channel';
import { fetchApi } from 'src/api/fetch';
import { apiChannelBase, apiUserBase } from 'src/api/routes';
import { useContext, useEffect, useState } from 'react';
import { Alert, Button, Card, Form, Image, Row, Stack } from 'react-bootstrap';
import * as Icon from 'react-bootstrap-icons';
import { AuthContext } from 'src/contexts';
import { type ISuccessMessage, type IUser } from '@model/user';

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

    const sendInvite = (): void => {
        setPending(true);
        setError(null);
        setInfo(null);
        fetchApi<ISuccessMessage>(
            `${apiChannelBase}/${channel.name}/add-owner`,
            {
                method: 'Post',
                body: JSON.stringify({
                    toUser: user,
                    permission: PermissionType.READWRITE,
                }),
            },
            auth,
            (a) => {
                setInfo(`mandata la richiesta a ${a.message}`);
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
                    <Form.Group>
                        <Form.Label>Aggiungi una persona</Form.Label>
                        <Form.Control
                            id="userAdd"
                            type="text"
                            disabled={pending}
                            onChange={(e) => {
                                setUser(e.target.value);
                            }}
                        />

                        <Button
                            onClick={() => {
                                sendInvite();
                            }}
                        >
                            Aggiungi{' '}
                            <Icon.PersonAdd style={{ marginRight: '1rem', height: '1.5rem', width: '1.5rem' }} />
                        </Button>
                    </Form.Group>
                    {info !== null && (
                        <Row>
                            <Alert variant="info">{info}</Alert>
                        </Row>
                    )}
                    {error !== null && (
                        <Row>
                            <Alert variant="danger">{error}</Alert>
                        </Row>
                    )}
                </Card>
            )}
            <Stack>
                {channel.users.map((member) => (
                    <ChannelMember key={member.user} member={member} admin={isAdmin} channel={channel.name} />
                ))}
            </Stack>
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
            `${apiUserBase}/${member.user}`,
            { method: 'GET' },
            null,
            (user) => {
                setUser(() => user);
            },
            (_) => { },
        );
    }, [member.user]);

    function PrivilegeIcon({ privilege }: { privilege: PermissionType }): JSX.Element {
        if (!admin) return <PrivilageToIcon privilage={privilege} />;

        const [priv, setPriv] = useState(privilege);
        const [pending, setPending] = useState(false);
        const onClick = (): void => {
            setPending(true);
            fetchApi<PermissionType>(
                `${apiChannelBase}/${channel}/set-permission`,
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
                            <Icon.Bell aria-label="notifica" />
                        ) : (
                            <Icon.BellSlash aria-label="notifica spenta" />
                        )}
                        <PrivilegeIcon privilege={member.privilege} />
                    </Stack>
                </div>
            </Stack>
            <hr style={{ margin: 0 }} />
        </>
    );
}

function PrivilageToIcon({ privilage }: { privilage: PermissionType }): JSX.Element {
    switch (privilage) {
        case PermissionType.WRITE:
            return <Icon.Pencil aria-label={privilage} title={privilage} />;
        case PermissionType.READ:
            return <Icon.Eyeglasses aria-label={privilage} title={privilage} />;
        case PermissionType.READWRITE:
            return <Icon.Pencil aria-label={privilage} title={privilage} />;
        case PermissionType.ADMIN:
            return <Icon.PersonCheck aria-label={privilage} title={privilage} />;
    }
    return <></>;
}
