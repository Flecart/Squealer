import { useContext, useState, useSyncExternalStore } from 'react';
import { Button, Row } from 'react-bootstrap';
import { fetchApi } from 'src/api/fetch';
import { apiUserBase } from 'src/api/routes';
import InviteMessage from 'src/components/InviteMessage';
import MessageListLoader from 'src/components/MessageListLoader';
import { AuthContext } from 'src/contexts';
import SidebarSearchLayout from 'src/layout/SidebarSearchLayout';
import { NotificationStore } from 'src/notification';

export default function Notification(): JSX.Element {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const notification = useSyncExternalStore(NotificationStore.subscribe, NotificationStore.getSnapshot);
    const [authState] = useContext(AuthContext);
    const clearAll = (): void => {
        setClear(true);
        fetchApi<string>(
            `${apiUserBase}/notification`,
            { method: 'DELETE' },
            authState,
            (_) => {
                NotificationStore.setNotification({
                    message: [],
                    invitation: [],
                });
                setClear(false);
            },
            (error) => {
                console.log(error);
                setClear(false);
            },
        );
    };
    return (
        <SidebarSearchLayout>
            <Row xs="auto" className="d-flex justify-content-center">
                <Button onClick={clearAll}>Clear All</Button>
            </Row>
            <h3>Invitation</h3>
            {notification.message.length === 0 ? (
                <p>No notification</p>
            ) : (
                <InviteMessageLoader invitation={notification.invitation} />
            )}
            <hr />
            <h3>Message</h3>
            {clear ? <p>Deleating Notification</p> : <MessageListLoader childrens={notification.message} />}
        </SidebarSearchLayout>
    );
}
