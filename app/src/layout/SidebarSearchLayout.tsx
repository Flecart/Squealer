import { SideBar } from '../components/SideBar';
import { Header } from '../components/Header';
import { Row, Col } from 'react-bootstrap';

interface Props {
    children: JSX.Element | JSX.Element[];
}

export default function SidebarSearchLayout({ children }: Props): JSX.Element {
    return (
        <Row className="vh-100">
            <Col md={3} className="d-none d-md-block">
                <SideBar />
            </Col>
            <Col md={6} className="border-start border-end border-light">
                <Header />
                {children instanceof Array ? children.map((child) => child) : children}
            </Col>
        </Row>
    );
}
