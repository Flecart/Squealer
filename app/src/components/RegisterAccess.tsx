import { useState } from 'react';
import { Button, Collapse, Container, Form, FormGroup, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';

export default function RegisterAccess() {
    const [open, setOpen] = useState(true);

    return (
        <Container id="navbar-register" className="container-fluid d-flex flex-column align-items-center">
            <ToggleButtonGroup type="radio" name="acc_or_reg" defaultValue={1} className="mt-5 m-0 me-4 z-index-1">
                <ToggleButton value={1} id="radio_ar_1" variant="light" onClick={() => setOpen(true)}>
                    Registrazione
                </ToggleButton>
                <ToggleButton value={2} id="radio_ar_2" variant="light" onClick={() => setOpen(false)}>
                    Accesso
                </ToggleButton>
            </ToggleButtonGroup>

            <Collapse in={open}>
                <Form className="m-0 me-4 py-3 px-3 border z-index-1" hidden={!open}>
                    <Form.Text className="text-light fs-5 text-center text-break">
                        Iscriviti rapidamente compilando il Form!
                    </Form.Text>
                    <FormGroup className="mb-3">
                        <Form.Label className="text-light">Username</Form.Label>
                        <Form.Control type="text" placeholder="Inserisci il tuo username" />
                    </FormGroup>
                    <FormGroup className="mb-3">
                        <Form.Label className="text-light">Email</Form.Label>
                        <Form.Control type="email" placeholder="Inserisci la tua email" />
                    </FormGroup>
                    <FormGroup className="mb-3">
                        <Form.Label className="text-light">Password</Form.Label>
                        <Form.Control type="password" placeholder="Inserisci la tua password" />
                    </FormGroup>
                    <Container className="d-flex justify-content-center">
                        <Button className="col-6 me-1" variant="outline-success" type="submit">
                            Registrati
                        </Button>
                        <Button className="col-6" variant="outline-danger" type="reset">
                            Cancella
                        </Button>
                    </Container>
                </Form>
            </Collapse>
            <Collapse in={!open}>
                <Form className="m-0 me-4 py-3 px-3 border z-index-0" hidden={open}>
                    <Form.Text className="text-light fs-5 text-center text-break">
                        Accedi inserendo le tue credenziali!
                    </Form.Text>
                    <FormGroup className="mb-3">
                        <Form.Label className="text-light">Username</Form.Label>
                        <Form.Control type="text" placeholder="Inserisci il tuo username" />
                    </FormGroup>
                    <FormGroup className="mb-3">
                        <Form.Label className="text-light">Password</Form.Label>
                        <Form.Control type="password" placeholder="Inserisci la tua password" />
                    </FormGroup>
                    <Container className="d-flex justify-content-center">
                        <Button className="col-6 me-1" variant="outline-primary" type="submit">
                            Accedi
                        </Button>
                        <Button className="col-6" variant="outline-danger" type="reset">
                            Cancella
                        </Button>
                    </Container>
                </Form>
            </Collapse>
        </Container>
    );
}
