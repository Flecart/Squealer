import { useContext, useState, useSyncExternalStore } from 'react';
import { SideBar } from './SideBar';
import { Navbar, Container, Offcanvas, Stack } from 'react-bootstrap';
// import { Nav, Form } from 'react-bootstrap';
import * as Icon from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { NotificationStore } from 'src/notification';
import { AuthContext } from 'src/contexts';

function NotificationHeader(): JSX.Element {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const notification = useSyncExternalStore(NotificationStore.subscribe, NotificationStore.getSnapshot);
    return (
        <>
            {' '}
            {notification.length > 0 ? (
                <Stack direction="horizontal" gap={1}>
                    <span className="badge bg-danger">{notification.length}</span>
                    <Icon.InboxFill className="d-flex" />
                </Stack>
            ) : (
                <Icon.Inbox className="d-flex" />
            )}
        </>
    );
}

export function Header(): JSX.Element {
    const navigator = useNavigate();
    const [authState] = useContext(AuthContext);
    const [show, setShow] = useState(false);
    const handleClose = (): void => {
        setShow(false);
    };
    const handleShow = (): void => {
        setShow(true);
    };

    return (
        <Navbar className="container-fluid" expand="lg" sticky="top">
            <Container className="d-flex flex-row justify-content-evenly px-3">
                <Navbar.Toggle onClick={handleShow} className="d-md-none bg-primary" />

                <Offcanvas show={show} onHide={handleClose}>
                    <Offcanvas.Header closeButton>
                        <Offcanvas.Title>Menu</Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body>
                        <SideBar />
                    </Offcanvas.Body>
                </Offcanvas>

                <Navbar.Brand
                    className="text-white flex-grow-1 ps-3 text-center"
                    onClick={() => {
                        navigator('/');
                    }}
                >
                    Squealer
                </Navbar.Brand>
                {authState !== null && (
                    <span
                        onClick={() => {
                            navigator('/notification');
                        }}
                    >
                        <NotificationHeader />
                    </span>
                )}
            </Container>
        </Navbar>
    );
}
