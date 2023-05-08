import { SideBar } from '../components/SideBar';
import { Header } from '../components/Header';
import { Container, Row, Col } from 'react-bootstrap';

interface Props {
    children: JSX.Element | JSX.Element[];
}

export default function SidebarSearchLayout({ children }: Props): JSX.Element {
    return (
        <Row>
            <Col md={3}>
                <Container className="d-none d-md-block">
                    <SideBar />
                </Container>
            </Col>
            <Col md={6} className="border-start border-end border-light">
                <Header />
                {children instanceof Array ? children.map((child) => child) : children}
            </Col>
        </Row>
    );
}
