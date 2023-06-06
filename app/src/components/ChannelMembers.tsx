import type * as channel from '@model/channel';
import { PermissionType } from '@model/channel';
import { fetchApi } from 'src/api/fetch';
import { apiChannelBase, apiUserBase } from 'src/api/routes';
import { type IUser } from '@model/user';
import { useContext, useEffect, useState } from 'react';
import { Alert, Button, Card, Form, Image, Row, Stack } from 'react-bootstrap';
import * as Icon from 'react-bootstrap-icons';
import { AuthContext } from 'src/contexts';

interface PrompsChannelMembers {
    channel: channel.IChannel;
}

interface ChannelUser {
    user: string;
    privilege: PermissionType;
    notification: boolean;
}

export default function ChannelMembers({ channel }: PrompsChannelMembers): JSX.Element {
    const [auth] = useContext(AuthContext);
    const permission = channel.users.find((user) => user.user === auth?.username)?.privilege;

    const [error, setError] = useState<null | string>(null);
    const [pending, setPending] = useState(false);
    const [info, setInfo] = useState<null | string>(null);

    const sendInvite = (): void => {
        setPending(true);
        setError(null);
        setInfo(null);
        fetchApi<string>(
            `${apiChannelBase}/${channel.name}/add-owner`,
            {
                method: 'Post',
                body: JSON.stringify({
                    toUser: document.getElementById('userAdd').value as string,
                    permission: PermissionType.READWRITE,
                }),
            },
            auth,
            (a) => {
                setInfo(`mandata la richiesta a ${a}`);
                setPending(false);
            },
            (e) => {
                setError(e.message);
                setPending(false);
            },
        );
    };

    return (
        <>
            {permission !== undefined && permission === PermissionType.ADMIN && (
                <Card body>
                    <Form.Group>
                        <Form.Label>Aggiungi una persona</Form.Label>
                        <Form.Control id="userAdd" type="text" disabled={pending} />

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
                    <ChannelMember key={member.user} member={member} />
                ))}
            </Stack>
        </>
    );
}

function ChannelMember({ member }: { member: ChannelUser }): JSX.Element {
    const [user, setUser] = useState<IUser | null>(null);
    useEffect(() => {
        fetchApi<IUser>(
            `${apiUserBase}/${member.user}`,
            { method: 'GET' },
            null,
            (user) => {
                setUser(() => user);
            },
            (_) => {},
        );
    }, [member.user]);

    function PrivilageIcon({ privivilage }: { privivilage: PermissionType }): JSX.Element {
        switch (privivilage) {
            case PermissionType.WRITE:
                return <Icon.Pencil title={privivilage} />;
            case PermissionType.READ:
                return <Icon.Eyeglasses title={privivilage} />;

            case PermissionType.READWRITE:
                return <Icon.Pencil title={privivilage} />;
            case PermissionType.ADMIN:
                return <Icon.PersonCheck title={privivilage} />;
        }
        return <></>;
    }

    return (
        <>
            <Stack style={{ minHeight: '4rem', maxHeight: '6rem' }} gat={3} direction="horizontal">
                <Image
                    className="w-100 float-end"
                    src={user?.profile_pic}
                    alt="profile image"
                    style={{ minWidth: '2rem', maxWidth: '2rem' }}
                    roundedCircle
                />
                <span>{member.user}</span>
                <div className="ms-auto">
                    {member.notification ? <Icon.Bell /> : <Icon.BellSlash />}
                    <PrivilageIcon privivilage={member.privilege} />
                </div>
            </Stack>
            <hr style={{ margin: 0 }} />
        </>
    );
}
