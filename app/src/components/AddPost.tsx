import React, { useState } from 'react';
import { Collapse, Container, Form, FormGroup, Button, ButtonGroup } from 'react-bootstrap';

export default function AddPost() {
    const [open, setOpen] = useState(false);
    return (
        <Container
            className="col-6-md col-4-lg border position-fixed bottom-0 start-50 translate-middle-x
                            d-flex flex-column align-items-center"
        >
            <Button
                className="col-3"
                variant="outline-primary"
                onClick={() => setOpen(!open)}
                aria-expanded={open}
                aria-controls="post_form"
            >
                Posta
            </Button>
            <Collapse in={open}>
                <Form className="bg-dark p-1" id="post_form">
                    <div className="d-flex flex-column align-items-center">
                        <FormGroup className="container-fluid">
                            <Form.Control type="text" placeholder="Inserisci Utenti e/o Canali destinatari" />

                            <Form.Control type="text" placeholder="Inserisci Testo" />

                            <Form.Control type="file" placeholder="Inserisci Immagine" />
                        </FormGroup>
                        <ButtonGroup className="justify-self-center">
                            <Button type="submit" variant="primary">
                                Posta
                            </Button>
                            <Button type="reset" variant="danger">
                                Annulla
                            </Button>
                        </ButtonGroup>
                    </div>
                </Form>
            </Collapse>
        </Container>
    );
}
