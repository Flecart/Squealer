import React from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import '../scss/App.scss';
import logo from '../logo.svg';
import { Container, Navbar } from 'react-bootstrap';
import { Button } from 'react-bootstrap';
import { Row, Col } from 'react-bootstrap';
import { MakeFeed } from '../components/Post';
import { Header } from '../components/Header';
import RegisterAccess from '../components/RegisterAccess';
import AddPost from '../components/AddPost';
import { Link } from 'react-router-dom';

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
            <Button className="rounded" variant="dark">
                <img src={logo} alt="logo" width="30" height="30" />
            </Button>

            <Link to="#">
                <Button className="rounded" variant="dark">
                    Esplora
                </Button>
            </Link>
            <Link to="#">
                <Button className="rounded" variant="dark">
                    Impostazioni
                </Button>
            </Link>
            <Link to="/login">
                <Button className="rounded" variant="dark">
                    Login
                </Button>
            </Link>
        </Navbar>
    );
}
