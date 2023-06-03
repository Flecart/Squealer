import { useContext, useState, useSyncExternalStore } from 'react';
import { Button, Row } from 'react-bootstrap';
import { fetchApi } from 'src/api/fetch';
import { apiUserBase } from 'src/api/routes';
import MessageListLoader from 'src/components/MessageListLoader';
import { AuthContext } from 'src/contexts';
import SidebarSearchLayout from 'src/layout/SidebarSearchLayout';
import { NotificationStore } from 'src/notification';

export default function Notification(): JSX.Element {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const notification = useSyncExternalStore(NotificationStore.subscribe, NotificationStore.getSnapshot);
    const [authState] = useContext(AuthContext);
    const [clear, setClear] = useState<boolean>(false);
    const clearAll = (): void => {
        setClear(true);
        fetchApi<string>(
            `${apiUserBase}/notification`,
            { method: 'DELETE' },
            authState,
            (_) => {
                NotificationStore.setNotification([]);
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
            <Row xs="auto" className="d-flex justify-content-cente">
                <Button onClick={clearAll}>Clear All</Button>
            </Row>
            {clear ? <p>Deleating Notification</p> : <MessageListLoader childrens={notification} />}
        </SidebarSearchLayout>
    );
}
