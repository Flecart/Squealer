import { useState } from 'react';
import { SideBar } from './SideBar';
import { Navbar, Container, Offcanvas } from 'react-bootstrap';
// import { Nav, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export function Header(): JSX.Element {
    const navigator = useNavigate();
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
                {/* <Navbar.Toggle aria-controls="basic-navbar-nav border" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="">
                        <Nav.Link href="#home"> Esplora </Nav.Link>
                        <NavDropdown title="Canali">
                            <NavDropdown.Item>Canale 1</NavDropdown.Item>
                            <NavDropdown.Item>Canale 2</NavDropdown.Item>
                        </NavDropdown>
                        <Form className="">
                            <Form.Control type="search" placeholder="Cerca un Utente" />
                        </Form>
                    </Nav>
                </Navbar.Collapse> 
                */}
            </Container>
        </Navbar>
    );
}
