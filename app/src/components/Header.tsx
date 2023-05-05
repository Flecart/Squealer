import { Nav, Navbar, Container, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export function Header(): JSX.Element {
    const navigator = useNavigate();
    return (
        <Navbar className="container-fluid" expand="lg" sticky="top">
            <Container className="d-flex flex-row justify-content-center">
                <Navbar.Brand
                    onClick={() => {
                        navigator('/');
                    }}
                >
                    Squealer
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav border" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="">
                        <Nav.Link href="#home"> Esplora </Nav.Link>
                        {/* <NavDropdown title="Canali">
                            <NavDropdown.Item>Canale 1</NavDropdown.Item>
                            <NavDropdown.Item>Canale 2</NavDropdown.Item>
                        </NavDropdown> */}
                        <Form className="">
                            <Form.Control type="search" placeholder="Cerca un Utente" />
                        </Form>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}
