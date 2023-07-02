import { type IInvitationRensponse } from '@model/invitation';
import { type IMessage } from '@model/message';
import { useContext, useEffect, useState } from 'react';
import { Alert, Spinner, Stack } from 'react-bootstrap';
import { fetchApi } from 'src/api/fetch';
import { apiUserInvitations } from 'src/api/routes';
import { AuthContext } from 'src/contexts';
import InviteMessage from './InviteMessage';

interface PropsMessageIds {
    invitations: string[];
    compare?: (a: IMessage, b: IMessage) => number;
}

export default function MessageListLoader({ invitations }: PropsMessageIds): JSX.Element {
    console.log(invitations);
    if (invitations.length === 0) return <></>;

    const [authState] = useContext(AuthContext);
    const [invitation, setInvitation] = useState<IInvitationRensponse[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        fetchApi<IInvitationRensponse[]>(
            apiUserInvitations,
            {
                method: 'GET',
            },
            authState,
            (invitation) => {
                console.log(invitation);
                setInvitation(invitation);
            },
            (error) => {
                console.log(error);
                setError(error.message);
            },
        );
    }, [invitations]);

    function Posts(): JSX.Element {
        if (invitation === null && error === null) {
            return <Spinner animation="border" role="status" />;
        } else if (invitation === null) {
            return <Alert variant="danger">{error}</Alert>;
        } else {
            return (
                <Stack>
                    {invitation.map((invitation) => {
                        return <InviteMessage key={invitation._id.toString()} invitation={invitation} />;
                    })}
                </Stack>
            );
        }
    }

    return <Posts />;
}
