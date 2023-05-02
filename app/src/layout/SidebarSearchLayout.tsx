import { SideBar } from '../components/SideBar';
import { Header } from '../components/Header';
import { Container, Row, Col } from 'react-bootstrap';

interface Props {
    children: JSX.Element;
}

export default function SidebarSearchLayout({ children }: Props): JSX.Element {
    return (
        <Row>
            <Col lg={3}>
                <Container className="d-none d-lg-block">
                    <SideBar />
                </Container>
            </Col>
            <Col lg={6} className="border-start border-end border-light">
                <Header />
                {children}
            </Col>
        </Row>
    );
}
