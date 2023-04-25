import React from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import './scss/App.scss';
import logo from './logo.svg';
import { Container, Navbar } from 'react-bootstrap';
import { Button } from 'react-bootstrap';
import { Row, Col } from 'react-bootstrap';
import { MakeFeed } from './components/Post';
import { Header } from './components/Header';
import RegisterAccess from './components/RegisterAccess';
import AddPost from './components/AddPost';

export default function App() {
    return (
        <div className="bg-dark">
            <Row>
                <Col lg={3}>
                    <Container className="d-none d-lg-block">
                        <LeftContent />
                    </Container>
                </Col>
                <Col lg={6} className="border-start border-end border-light">
                    <Header />
                    <MakeFeed />
                    <AddPost />
                </Col>
                <Col className="" lg={3}>
                    <Navbar className="d-none d-lg-block col-3 position-fixed top-0 end-0" expand="lg">
                        <RegisterAccess />
                    </Navbar>
                </Col>
            </Row>
        </div>
    );
}

function LeftContent() {
    return (
        <Navbar className="d-none d-lg-flex flex-column align-items-start ps-3" sticky="top">
            <DarkButton img={logo} />
            <DarkButton text="Esplora" />
            <DarkButton text="Impostazioni" />
        </Navbar>
    );
}

interface DarkButtonProps {
    text?: string;
    img?: string;
}

// TODO: refactor
function DarkButton({ text, img }: DarkButtonProps) {
    let label;
    if (img != null) {
        label = <img src={img} alt="logo" width="30" height="30" />;
    } else {
        label = <label className="fs-4">{text}</label>;
    }

    return (
        <Button as="a" className="rounded" variant="dark">
            {label}
        </Button>
    );
}
