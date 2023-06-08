import { SideBar } from '../components/SideBar';
import { Header } from '../components/Header';
import { Col, Container } from 'react-bootstrap';

interface Props {
    children: JSX.Element | JSX.Element[];
}

export default function SidebarSearchLayout({ children }: Props): JSX.Element {
    return (
        <Container className="d-flex justify-content-center" style={{ background: 'var(--bs-body-bg);' }}>
            <Col md={3} className="d-none d-md-block">
                <SideBar />
            </Col>
            <Col md={6} id="mainCol">
                <Header />
                {children instanceof Array ? children.map((child) => child) : children}
            </Col>
            <Col md={3} className="d-none d-md-block"></Col>
        </Container>
    );
}
