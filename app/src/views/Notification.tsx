import { useContext, useState, useSyncExternalStore } from 'react';
import { Button, Row, Spinner } from 'react-bootstrap';
import { fetchApi } from 'src/api/fetch';
import { apiUserNotifications, apiUserSetNotification } from 'src/api/routes';
import InvitationListLoader from 'src/components/InvitationListLoader';
import NotificationListLoader from 'src/components/NotificationListLoader';
import { AuthContext } from 'src/contexts';
import SidebarSearchLayout from 'src/layout/SidebarSearchLayout';
import { NotificationStore } from 'src/notification';
import { stringFormat } from 'src/utils';

export default function Notification(): JSX.Element {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const notification = useSyncExternalStore(NotificationStore.subscribe, NotificationStore.getSnapshot);
    const [authState] = useContext(AuthContext);
    const [loading, setLoading] = useState<boolean>(false);

    const clearAll = (): void => {
        setLoading(() => true);
        fetchApi<string>(
            apiUserNotifications,
            { method: 'DELETE' },
            authState,
            (_) => {
                NotificationStore.setNotification({
                    message: [],
                    invitation: notification.invitation,
                });
                setLoading(() => false);
            },
            (_) => {
                setLoading(() => false);
            },
        );
    };
    const delteNotification = (id: string): void => {
        fetchApi<string>(
            stringFormat(apiUserSetNotification, [id]),
            { method: 'DELETE' },
            authState,
            (_) => {
                NotificationStore.setNotification({
                    message: notification.message.filter((message) => message !== id),
                    invitation: notification.invitation,
                });
            },
            (_) => {},
        );
    };

    return (
        <SidebarSearchLayout>
            {loading ? (
                <Spinner animation="border" role="status" />
            ) : (
                <>
                    <Row xs="auto" className="d-flex justify-content-center">
                        <Button onClick={clearAll}>Clear All</Button>
                    </Row>
                    <h3>Invitation</h3>
                    {notification.invitation.length === 0 ? (
                        <p>No invitation</p>
                    ) : (
                        <InvitationListLoader invitations={notification.invitation} />
                    )}
                    <hr />
                    <h3>Message</h3>
                    {notification.message.length === 0 ? (
                        <p>No more notifications</p>
                    ) : (
                        <NotificationListLoader childrens={notification.message} notification={delteNotification} />
                    )}
                </>
            )}
        </SidebarSearchLayout>
    );
}
