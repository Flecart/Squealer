import { useContext, useState, useSyncExternalStore } from 'react';
import { SideBar } from 'src/components/SideBar';
import { Navbar, Container, Offcanvas, Stack, Col } from 'react-bootstrap';
import * as Icon from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import { NotificationStore } from 'src/notification';
import { AuthContext } from 'src/contexts';
import { LogoLight, LogoSize } from 'app/logos/LogosInfo';
import 'src/scss/SideButton.scss';

const notifSize = (parseInt(LogoSize) - 25).toString();
const menuSize = (parseInt(LogoSize) - 10).toString();

function NotificationHeader(): JSX.Element {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const notification = useSyncExternalStore(NotificationStore.subscribe, NotificationStore.getSnapshot);
    const len = notification.message.length + notification.invitation.length;
    return (
        <>
            {' '}
            {len > 0 ? (
                <Stack direction="horizontal" gap={1}>
                    <span className="badge bg-danger">{len}</span>
                    <Icon.InboxFill aria-hidden="true" width={notifSize} height={notifSize} className="d-flex" />
                </Stack>
            ) : (
                <Icon.Inbox aria-hidden="true" width={notifSize} height={notifSize} className="d-flex" />
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
        <Navbar
            variant="dark"
            className="container-fluid text-white"
            style={{ background: 'var(--bs-body-bg)' }}
            expand="lg"
            sticky="top"
        >
            <Offcanvas show={show} onHide={handleClose}>
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Menu</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <SideBar />
                </Offcanvas.Body>
            </Offcanvas>

            <Container fluid>
                <Col sx={3} className="d-flex justify-content-center">
                    <button
                        role="menu"
                        onClick={handleShow}
                        tabIndex={0}
                        aria-label="navigation - menu"
                        className="btn sideButton rounded-3 d-md-none"
                    >
                        <Icon.List aria-hidden="true" width={menuSize} height={menuSize} />
                    </button>
                </Col>

                <Col sx={6}>
                    <Navbar.Brand
                        className="d-flex justify-content-center align-items-center mr-0"
                        href="/"
                        tabIndex={0}
                    >
                        <img
                            src={LogoLight}
                            width={LogoSize}
                            height={LogoSize}
                            className="d-inline-block align-top pe-1"
                            alt=""
                            aria-hidden="true"
                        />
                        <span className="fs-3">Squealer</span>
                    </Navbar.Brand>
                </Col>

                <Col sx={3} className="d-flex justify-content-center">
                    {authState !== null && (
                        <button
                            className="btn sideButton rounded-3"
                            aria-label="notification page"
                            onClick={() => {
                                navigator('/notification');
                            }}
                            tabIndex={0}
                        >
                            <NotificationHeader />
                        </button>
                    )}
                </Col>
            </Container>
        </Navbar>
    );
}
